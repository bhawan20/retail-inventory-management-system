const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

// GET /api/transfers
router.get('/', (req, res) => {
  const { status, warehouse } = req.query;

  let sql = `
    SELECT 
      t.*,
      w1.name AS source_warehouse_name,
      w1.code AS source_warehouse_code,
      w2.name AS dest_warehouse_name,
      w2.code AS dest_warehouse_code,
      p.name AS product_name,
      p.sku AS product_sku
    FROM stock_transfers t
    JOIN warehouses w1 ON t.source_warehouse_id = w1.id
    JOIN warehouses w2 ON t.dest_warehouse_id = w2.id
    JOIN products p ON t.product_id = p.id
  `;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push(`t.status = ?`);
    params.push(status);
  }

  if (warehouse) {
    conditions.push(`(t.source_warehouse_id = ? OR t.dest_warehouse_id = ?)`);
    params.push(warehouse, warehouse);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  sql += ` ORDER BY t.created_at DESC`;

  const transfers = query(sql, params);
  res.json({ transfers });
});

// POST /api/transfers
router.post('/', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK'), (req, res) => {
  const { source_warehouse_id, dest_warehouse_id, product_id, quantity, tracking_notes } = req.body;

  if (!source_warehouse_id || !dest_warehouse_id || !product_id || !quantity) {
    return res.status(400).json({ error: 'Source Warehouse, Destination Warehouse, Product, and Quantity are required.' });
  }

  if (source_warehouse_id === dest_warehouse_id) {
    return res.status(400).json({ error: 'Source and Destination warehouses must be different.' });
  }

  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than zero.' });
  }

  // Check available stock at source warehouse
  const srcInv = get(`SELECT quantity, reserved_quantity FROM inventory WHERE product_id = ? AND warehouse_id = ?`, [product_id, source_warehouse_id]);
  const available = srcInv ? (srcInv.quantity - srcInv.reserved_quantity) : 0;

  if (available < qty) {
    return res.status(400).json({ error: `Insufficient available stock at source warehouse. Available: ${available}, Requested: ${qty}.` });
  }

  const id = `trf-${Date.now()}`;
  const transferNumber = `TRF-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  run(`
    INSERT INTO stock_transfers (id, transfer_number, source_warehouse_id, dest_warehouse_id, product_id, quantity, status, initiated_by, tracking_notes)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
  `, [id, transferNumber, source_warehouse_id, dest_warehouse_id, product_id, qty, req.user.full_name || req.user.username, tracking_notes || '']);

  logAudit('TRANSFER_CREATE', 'STOCK_TRANSFER', id, `Initiated transfer ${transferNumber} (${qty} units of product ${product_id})`, req.user.username);

  res.status(201).json({ message: 'Stock transfer initiated', id, transferNumber });
});

// PUT /api/transfers/:id/dispatch
router.put('/:id/dispatch', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK'), (req, res) => {
  const transfer = get(`SELECT * FROM stock_transfers WHERE id = ?`, [req.params.id]);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found.' });
  }

  if (transfer.status !== 'PENDING') {
    return res.status(400).json({ error: `Cannot dispatch transfer in '${transfer.status}' status. Must be PENDING.` });
  }

  // Validate stock again
  const srcInv = get(`SELECT quantity, reserved_quantity FROM inventory WHERE product_id = ? AND warehouse_id = ?`, [transfer.product_id, transfer.source_warehouse_id]);
  if (!srcInv || srcInv.quantity < transfer.quantity) {
    return res.status(400).json({ error: 'Source warehouse does not have enough stock to fulfill this dispatch.' });
  }

  // Deduct from source warehouse
  run(`UPDATE inventory SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?`, [transfer.quantity, transfer.product_id, transfer.source_warehouse_id]);

  // Update transfer status
  run(`
    UPDATE stock_transfers
    SET status = 'IN_TRANSIT', dispatched_at = datetime('now')
    WHERE id = ?
  `, [req.params.id]);

  logAudit('TRANSFER_DISPATCH', 'STOCK_TRANSFER', req.params.id, `Dispatched transfer ${transfer.transfer_number} (${transfer.quantity} units)`, req.user.username);

  res.json({ message: 'Transfer dispatched successfully and marked IN_TRANSIT' });
});

// PUT /api/transfers/:id/receive
router.put('/:id/receive', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK'), (req, res) => {
  const transfer = get(`SELECT * FROM stock_transfers WHERE id = ?`, [req.params.id]);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found.' });
  }

  if (transfer.status !== 'IN_TRANSIT') {
    return res.status(400).json({ error: `Cannot receive transfer in '${transfer.status}' status. Must be IN_TRANSIT.` });
  }

  // Ensure inventory row exists in destination
  let destInv = get(`SELECT id FROM inventory WHERE product_id = ? AND warehouse_id = ?`, [transfer.product_id, transfer.dest_warehouse_id]);
  if (!destInv) {
    run(`INSERT INTO inventory (id, product_id, warehouse_id, quantity, reserved_quantity, bin_location) VALUES (?, ?, ?, 0, 0, 'AISLE-01-A-01')`,
      [`inv-${transfer.product_id}-${transfer.dest_warehouse_id}`, transfer.product_id, transfer.dest_warehouse_id]
    );
  }

  // Add stock to destination warehouse
  run(`UPDATE inventory SET quantity = quantity + ?, last_audit_date = date('now') WHERE product_id = ? AND warehouse_id = ?`, [transfer.quantity, transfer.product_id, transfer.dest_warehouse_id]);

  // Mark received
  run(`
    UPDATE stock_transfers
    SET status = 'RECEIVED', received_at = datetime('now')
    WHERE id = ?
  `, [req.params.id]);

  logAudit('TRANSFER_RECEIVE', 'STOCK_TRANSFER', req.params.id, `Received transfer ${transfer.transfer_number} into destination warehouse`, req.user.username);

  res.json({ message: 'Transfer received successfully and destination inventory updated' });
});

// PUT /api/transfers/:id/cancel
router.put('/:id/cancel', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), (req, res) => {
  const transfer = get(`SELECT * FROM stock_transfers WHERE id = ?`, [req.params.id]);
  if (!transfer) {
    return res.status(404).json({ error: 'Transfer not found.' });
  }

  if (transfer.status === 'RECEIVED') {
    return res.status(400).json({ error: 'Cannot cancel an already received transfer.' });
  }

  // If in transit, restore source stock
  if (transfer.status === 'IN_TRANSIT') {
    run(`UPDATE inventory SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?`, [transfer.quantity, transfer.product_id, transfer.source_warehouse_id]);
  }

  run(`UPDATE stock_transfers SET status = 'CANCELLED' WHERE id = ?`, [req.params.id]);

  logAudit('TRANSFER_CANCEL', 'STOCK_TRANSFER', req.params.id, `Cancelled transfer ${transfer.transfer_number}`, req.user.username);

  res.json({ message: 'Transfer cancelled successfully' });
});

module.exports = router;
