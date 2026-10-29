const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

// GET /api/purchase-orders
router.get('/', (req, res) => {
  const { status, supplier_id, warehouse_id } = req.query;

  let sql = `
    SELECT 
      po.*,
      s.name AS supplier_name,
      s.code AS supplier_code,
      w.name AS destination_warehouse_name,
      w.code AS destination_warehouse_code,
      COUNT(poi.id) AS total_line_items,
      COALESCE(SUM(poi.quantity_ordered), 0) AS total_units_ordered,
      COALESCE(SUM(poi.quantity_received), 0) AS total_units_received
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    JOIN warehouses w ON po.destination_warehouse_id = w.id
    LEFT JOIN purchase_order_items poi ON po.id = poi.po_id
  `;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push(`po.status = ?`);
    params.push(status);
  }

  if (supplier_id) {
    conditions.push(`po.supplier_id = ?`);
    params.push(supplier_id);
  }

  if (warehouse_id) {
    conditions.push(`po.destination_warehouse_id = ?`);
    params.push(warehouse_id);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  sql += ` GROUP BY po.id ORDER BY po.order_date DESC, po.id DESC`;

  const orders = query(sql, params);
  res.json({ orders });
});

// GET /api/purchase-orders/:id
router.get('/:id', (req, res) => {
  const order = get(`
    SELECT 
      po.*,
      s.name AS supplier_name,
      s.code AS supplier_code,
      s.contact_name AS supplier_contact,
      s.email AS supplier_email,
      s.phone AS supplier_phone,
      w.name AS destination_warehouse_name,
      w.code AS destination_warehouse_code,
      w.location AS destination_warehouse_location,
      w.address AS destination_warehouse_address
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    JOIN warehouses w ON po.destination_warehouse_id = w.id
    WHERE po.id = ?
  `, [req.params.id]);

  if (!order) {
    return res.status(404).json({ error: 'Purchase Order not found.' });
  }

  const items = query(`
    SELECT 
      poi.*,
      p.name AS product_name,
      p.sku,
      p.barcode,
      p.unit_of_measure,
      (poi.quantity_ordered * poi.unit_cost) AS line_total
    FROM purchase_order_items poi
    JOIN products p ON poi.product_id = p.id
    WHERE poi.po_id = ?
  `, [req.params.id]);

  res.json({ order, items });
});

// POST /api/purchase-orders
router.post('/', authenticate, authorize('ADMIN', 'PROCUREMENT_MANAGER'), (req, res) => {
  const { supplier_id, destination_warehouse_id, expected_delivery, notes, items } = req.body;

  if (!supplier_id || !destination_warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Supplier, Destination Warehouse, and at least one item are required.' });
  }

  let totalAmount = 0;
  for (const item of items) {
    if (!item.product_id || !item.quantity || Number(item.quantity) <= 0) {
      return res.status(400).json({ error: 'Each item must have a valid product_id and quantity > 0.' });
    }
    const cost = item.unit_cost != null ? Number(item.unit_cost) : 0;
    totalAmount += cost * Number(item.quantity);
  }

  const id = `po-${Date.now()}`;
  const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
  const orderDate = new Date().toISOString().split('T')[0];

  run(`
    INSERT INTO purchase_orders (id, po_number, supplier_id, destination_warehouse_id, status, total_amount, order_date, expected_delivery, notes, created_by)
    VALUES (?, ?, ?, ?, 'ORDERED', ?, ?, ?, ?, ?)
  `, [
    id,
    poNumber,
    supplier_id,
    destination_warehouse_id,
    totalAmount,
    orderDate,
    expected_delivery || null,
    notes || '',
    req.user.full_name || req.user.username
  ]);

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    run(`
      INSERT INTO purchase_order_items (id, po_id, product_id, quantity_ordered, quantity_received, unit_cost)
      VALUES (?, ?, ?, ?, 0, ?)
    `, [`poi-${id}-${i + 1}`, id, it.product_id, Number(it.quantity), Number(it.unit_cost || 0)]);
  }

  logAudit('CREATE_PO', 'PURCHASE_ORDER', id, `Created purchase order ${poNumber} for $${totalAmount.toFixed(2)}`, req.user.username);

  res.status(201).json({ message: 'Purchase Order created successfully', id, poNumber });
});

// PUT /api/purchase-orders/:id/receive
router.put('/:id/receive', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK', 'PROCUREMENT_MANAGER'), (req, res) => {
  const order = get(`SELECT * FROM purchase_orders WHERE id = ?`, [req.params.id]);
  if (!order) {
    return res.status(404).json({ error: 'Purchase Order not found.' });
  }

  if (order.status === 'RECEIVED') {
    return res.status(400).json({ error: 'Purchase Order is already marked as received.' });
  }

  const items = query(`SELECT * FROM purchase_order_items WHERE po_id = ?`, [req.params.id]);
  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Purchase order has no items to receive.' });
  }

  // Auto-increment warehouse inventory for each item
  for (const item of items) {
    const unreceived = item.quantity_ordered - item.quantity_received;
    if (unreceived > 0) {
      // Ensure inventory row exists
      let inv = get(`SELECT id FROM inventory WHERE product_id = ? AND warehouse_id = ?`, [item.product_id, order.destination_warehouse_id]);
      if (!inv) {
        run(`
          INSERT INTO inventory (id, product_id, warehouse_id, quantity, reserved_quantity, bin_location)
          VALUES (?, ?, ?, 0, 0, 'AISLE-01-A-01')
        `, [`inv-${item.product_id}-${order.destination_warehouse_id}`, item.product_id, order.destination_warehouse_id]);
      }

      run(`
        UPDATE inventory 
        SET quantity = quantity + ?, last_audit_date = date('now')
        WHERE product_id = ? AND warehouse_id = ?
      `, [unreceived, item.product_id, order.destination_warehouse_id]);

      run(`
        UPDATE purchase_order_items
        SET quantity_received = quantity_ordered
        WHERE id = ?
      `, [item.id]);
    }
  }

  // Update PO status
  run(`
    UPDATE purchase_orders
    SET status = 'RECEIVED', received_date = date('now')
    WHERE id = ?
  `, [req.params.id]);

  logAudit('RECEIVE_PO', 'PURCHASE_ORDER', req.params.id, `Received full shipment for ${order.po_number} into warehouse ${order.destination_warehouse_id}`, req.user.username);

  res.json({ message: 'Goods received successfully and warehouse stock updated.' });
});

module.exports = router;
