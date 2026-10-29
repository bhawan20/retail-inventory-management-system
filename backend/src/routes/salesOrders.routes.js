const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

// GET /api/sales-orders
router.get('/', (req, res) => {
  const { status, warehouse_id } = req.query;

  let sql = `
    SELECT 
      so.*,
      w.name AS fulfillment_warehouse_name,
      w.code AS fulfillment_warehouse_code,
      COUNT(soi.id) AS total_items_count,
      COALESCE(SUM(soi.quantity), 0) AS total_units_ordered
    FROM sales_orders so
    LEFT JOIN warehouses w ON so.fulfillment_warehouse_id = w.id
    LEFT JOIN sales_order_items soi ON so.id = soi.order_id
  `;

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push(`so.status = ?`);
    params.push(status);
  }

  if (warehouse_id) {
    conditions.push(`so.fulfillment_warehouse_id = ?`);
    params.push(warehouse_id);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  sql += ` GROUP BY so.id ORDER BY so.created_at DESC`;

  const orders = query(sql, params);
  res.json({ orders });
});

// GET /api/sales-orders/:id
router.get('/:id', (req, res) => {
  const order = get(`
    SELECT 
      so.*,
      w.name AS fulfillment_warehouse_name,
      w.code AS fulfillment_warehouse_code,
      w.address AS fulfillment_warehouse_address,
      w.contact_phone AS warehouse_phone
    FROM sales_orders so
    LEFT JOIN warehouses w ON so.fulfillment_warehouse_id = w.id
    WHERE so.id = ?
  `, [req.params.id]);

  if (!order) {
    return res.status(404).json({ error: 'Sales Order not found.' });
  }

  const items = query(`
    SELECT 
      soi.*,
      p.name AS product_name,
      p.sku,
      p.barcode,
      p.image_url,
      p.unit_of_measure,
      (soi.quantity * soi.unit_price) AS line_total,
      COALESCE(inv.quantity, 0) AS current_warehouse_stock,
      COALESCE(inv.bin_location, 'N/A') AS bin_location
    FROM sales_order_items soi
    JOIN products p ON soi.product_id = p.id
    LEFT JOIN inventory inv ON (p.id = inv.product_id AND inv.warehouse_id = ?)
    WHERE soi.order_id = ?
  `, [order.fulfillment_warehouse_id, req.params.id]);

  res.json({ order, items });
});

// POST /api/sales-orders
router.post('/', authenticate, authorize('ADMIN', 'SALES_REP'), (req, res) => {
  const { customer_name, customer_email, customer_address, fulfillment_warehouse_id, items } = req.body;

  if (!customer_name || !fulfillment_warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer Name, Fulfillment Warehouse, and at least one item are required.' });
  }

  // Validate stock in the chosen warehouse
  for (const item of items) {
    const inv = get(`SELECT quantity, reserved_quantity FROM inventory WHERE product_id = ? AND warehouse_id = ?`, [item.product_id, fulfillment_warehouse_id]);
    const available = inv ? (inv.quantity - inv.reserved_quantity) : 0;
    if (available < Number(item.quantity)) {
      const prod = get(`SELECT name FROM products WHERE id = ?`, [item.product_id]);
      return res.status(400).json({
        error: `Insufficient available stock for product '${prod?.name || item.product_id}'. Available: ${available}, Requested: ${item.quantity}.`
      });
    }
  }

  let totalAmount = 0;
  for (const it of items) {
    totalAmount += Number(it.quantity) * Number(it.unit_price || 0);
  }

  const id = `so-${Date.now()}`;
  const orderNumber = `SO-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  run(`
    INSERT INTO sales_orders (id, order_number, customer_name, customer_email, customer_address, fulfillment_warehouse_id, status, total_amount, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, 'PAID')
  `, [id, orderNumber, customer_name, customer_email || '', customer_address || '', fulfillment_warehouse_id, totalAmount]);

  // Insert items and reserve inventory
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    run(`
      INSERT INTO sales_order_items (id, order_id, product_id, quantity, unit_price)
      VALUES (?, ?, ?, ?, ?)
    `, [`soi-${id}-${i + 1}`, id, it.product_id, Number(it.quantity), Number(it.unit_price)]);

    // Reserve stock
    run(`
      UPDATE inventory
      SET reserved_quantity = reserved_quantity + ?
      WHERE product_id = ? AND warehouse_id = ?
    `, [Number(it.quantity), it.product_id, fulfillment_warehouse_id]);
  }

  logAudit('CREATE_SO', 'SALES_ORDER', id, `Created sales order ${orderNumber} for $${totalAmount.toFixed(2)}`, req.user.username);

  res.status(201).json({ message: 'Sales Order created and inventory reserved.', id, orderNumber });
});

// PUT /api/sales-orders/:id/status
router.put('/:id/status', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER', 'INVENTORY_CLERK', 'SALES_REP'), (req, res) => {
  const { status, carrier, tracking_number } = req.body;
  const order = get(`SELECT * FROM sales_orders WHERE id = ?`, [req.params.id]);

  if (!order) {
    return res.status(404).json({ error: 'Sales Order not found.' });
  }

  const validTransitions = ['PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validTransitions.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validTransitions.join(', ')}` });
  }

  const items = query(`SELECT product_id, quantity FROM sales_order_items WHERE order_id = ?`, [req.params.id]);

  // If transitioning to SHIPPED: physically deduct inventory and clear reserved quantities
  if (status === 'SHIPPED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
    for (const item of items) {
      run(`
        UPDATE inventory
        SET 
          quantity = MAX(0, quantity - ?),
          reserved_quantity = MAX(0, reserved_quantity - ?)
        WHERE product_id = ? AND warehouse_id = ?
      `, [item.quantity, item.quantity, item.product_id, order.fulfillment_warehouse_id]);
    }

    const shippedCarrier = carrier || order.carrier || 'FedEx Logistics';
    const trackingCode = tracking_number || order.tracking_number || `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;

    run(`
      UPDATE sales_orders
      SET status = ?, shipped_at = datetime('now'), carrier = ?, tracking_number = ?
      WHERE id = ?
    `, [status, shippedCarrier, trackingCode, req.params.id]);

    logAudit('SHIP_SO', 'SALES_ORDER', req.params.id, `Order ${order.order_number} shipped via ${shippedCarrier} (${trackingCode})`, req.user.username);

    return res.json({ message: `Order marked as ${status}`, tracking_number: trackingCode });
  }

  // If CANCELLED before shipping: release reservations
  if (status === 'CANCELLED' && order.status !== 'SHIPPED' && order.status !== 'DELIVERED') {
    for (const item of items) {
      run(`
        UPDATE inventory
        SET reserved_quantity = MAX(0, reserved_quantity - ?)
        WHERE product_id = ? AND warehouse_id = ?
      `, [item.quantity, item.product_id, order.fulfillment_warehouse_id]);
    }
  }

  run(`UPDATE sales_orders SET status = ? WHERE id = ?`, [status, req.params.id]);

  logAudit('UPDATE_SO_STATUS', 'SALES_ORDER', req.params.id, `Order ${order.order_number} status updated to ${status}`, req.user.username);

  res.json({ message: `Order status updated to ${status}` });
});

module.exports = router;
