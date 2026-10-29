const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

// GET /api/inventory/matrix
router.get('/matrix', (req, res) => {
  const warehouses = query(`SELECT id, name, code FROM warehouses ORDER BY name ASC`);
  const products = query(`
    SELECT p.id, p.sku, p.name, p.reorder_point, p.unit_price, p.cost_price, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.name ASC
  `);

  const inventoryRecords = query(`SELECT product_id, warehouse_id, quantity, reserved_quantity, bin_location FROM inventory`);

  // Build matrix lookup
  const stockMap = {};
  for (const inv of inventoryRecords) {
    if (!stockMap[inv.product_id]) stockMap[inv.product_id] = {};
    stockMap[inv.product_id][inv.warehouse_id] = {
      quantity: inv.quantity,
      reserved: inv.reserved_quantity,
      available: Math.max(0, inv.quantity - inv.reserved_quantity),
      bin: inv.bin_location
    };
  }

  const matrix = products.map(prod => {
    let totalQty = 0;
    let totalReserved = 0;
    const warehouseStocks = {};

    for (const wh of warehouses) {
      const stock = stockMap[prod.id]?.[wh.id] || { quantity: 0, reserved: 0, available: 0, bin: 'N/A' };
      warehouseStocks[wh.id] = stock;
      totalQty += stock.quantity;
      totalReserved += stock.reserved;
    }

    return {
      ...prod,
      total_quantity: totalQty,
      total_reserved: totalReserved,
      available_quantity: Math.max(0, totalQty - totalReserved),
      is_low_stock: totalQty <= prod.reorder_point,
      is_out_of_stock: totalQty === 0,
      stocks: warehouseStocks
    };
  });

  res.json({ warehouses, matrix });
});

// GET /api/inventory/low-stock-alerts
router.get('/low-stock-alerts', (req, res) => {
  const alerts = query(`
    SELECT 
      p.id,
      p.sku,
      p.name,
      p.reorder_point,
      p.reorder_quantity,
      c.name AS category_name,
      COALESCE(SUM(i.quantity), 0) AS total_quantity,
      COALESCE(SUM(i.reserved_quantity), 0) AS total_reserved,
      COALESCE(SUM(i.quantity - i.reserved_quantity), 0) AS available_quantity
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN inventory i ON p.id = i.product_id
    GROUP BY p.id
    HAVING total_quantity <= p.reorder_point
    ORDER BY total_quantity ASC
  `);

  res.json({ alerts, count: alerts.length });
});

// POST /api/inventory/adjust
router.post('/adjust', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK'), (req, res) => {
  const { product_id, warehouse_id, adjustment_type, quantity_delta, reason } = req.body;

  if (!product_id || !warehouse_id || !adjustment_type || quantity_delta === undefined || !reason) {
    return res.status(400).json({ error: 'Product ID, Warehouse ID, Adjustment Type, Quantity Delta, and Reason are required.' });
  }

  const delta = Number(quantity_delta);
  if (isNaN(delta) || delta === 0) {
    return res.status(400).json({ error: 'Quantity Delta must be a non-zero number.' });
  }

  // Ensure inventory record exists
  let inv = get(`SELECT * FROM inventory WHERE product_id = ? AND warehouse_id = ?`, [product_id, warehouse_id]);
  if (!inv) {
    const invId = `inv-${product_id}-${warehouse_id}`;
    run(`INSERT INTO inventory (id, product_id, warehouse_id, quantity, reserved_quantity, bin_location) VALUES (?, ?, ?, 0, 0, 'AISLE-01-A-01')`, [invId, product_id, warehouse_id]);
    inv = { quantity: 0, reserved_quantity: 0 };
  }

  const newQty = inv.quantity + delta;
  if (newQty < 0) {
    return res.status(400).json({ error: `Adjustment would result in negative stock balance (${newQty}). Current: ${inv.quantity}.` });
  }

  run(`
    UPDATE inventory 
    SET quantity = ?, last_audit_date = date('now')
    WHERE product_id = ? AND warehouse_id = ?
  `, [newQty, product_id, warehouse_id]);

  const adjId = `adj-${Date.now()}`;
  run(`
    INSERT INTO stock_adjustments (id, product_id, warehouse_id, adjustment_type, quantity_delta, reason, performed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [adjId, product_id, warehouse_id, adjustment_type, delta, reason, req.user.full_name || req.user.username]);

  logAudit(
    'STOCK_ADJUSTMENT',
    'INVENTORY',
    adjId,
    `Adjusted stock for product ${product_id} at warehouse ${warehouse_id} by ${delta > 0 ? '+' : ''}${delta} (${adjustment_type}: ${reason})`,
    req.user.username
  );

  res.json({ message: 'Stock adjusted successfully', newQuantity: newQty, adjustmentId: adjId });
});

// PUT /api/inventory/bin-location
router.put('/bin-location', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK'), (req, res) => {
  const { product_id, warehouse_id, bin_location } = req.body;
  if (!product_id || !warehouse_id || !bin_location) {
    return res.status(400).json({ error: 'Product ID, Warehouse ID, and Bin Location are required.' });
  }

  run(`
    UPDATE inventory
    SET bin_location = ?
    WHERE product_id = ? AND warehouse_id = ?
  `, [bin_location.trim().toUpperCase(), product_id, warehouse_id]);

  res.json({ message: 'Bin location updated successfully' });
});

module.exports = router;
