const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

// GET /api/warehouses
router.get('/', (req, res) => {
  const warehouses = query(`
    SELECT 
      w.*,
      COALESCE(SUM(i.quantity), 0) AS total_units_stored,
      COUNT(DISTINCT CASE WHEN i.quantity > 0 THEN i.product_id END) AS active_skus_count,
      ROUND(COALESCE(SUM(i.quantity * p.cost_price), 0), 2) AS total_inventory_value,
      ROUND(COALESCE(SUM(i.quantity) * 100.0 / NULLIF(w.capacity, 0), 0), 1) AS utilization_percent
    FROM warehouses w
    LEFT JOIN inventory i ON w.id = i.warehouse_id
    LEFT JOIN products p ON i.product_id = p.id
    GROUP BY w.id
    ORDER BY w.name ASC
  `);

  res.json({ warehouses });
});

// GET /api/warehouses/:id
router.get('/:id', (req, res) => {
  const warehouse = get(`
    SELECT 
      w.*,
      COALESCE(SUM(i.quantity), 0) AS total_units_stored,
      ROUND(COALESCE(SUM(i.quantity * p.cost_price), 0), 2) AS total_inventory_value,
      ROUND(COALESCE(SUM(i.quantity) * 100.0 / NULLIF(w.capacity, 0), 0), 1) AS utilization_percent
    FROM warehouses w
    LEFT JOIN inventory i ON w.id = i.warehouse_id
    LEFT JOIN products p ON i.product_id = p.id
    WHERE w.id = ?
    GROUP BY w.id
  `, [req.params.id]);

  if (!warehouse) {
    return res.status(404).json({ error: 'Warehouse not found.' });
  }

  const items = query(`
    SELECT 
      i.*,
      p.name AS product_name,
      p.sku,
      p.barcode,
      p.unit_price,
      p.cost_price,
      p.reorder_point,
      c.name AS category_name
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE i.warehouse_id = ?
    ORDER BY p.name ASC
  `, [req.params.id]);

  res.json({ warehouse, items });
});

// POST /api/warehouses
router.post('/', authenticate, authorize('ADMIN'), (req, res) => {
  const { name, code, location, address, capacity, manager_name, contact_email, contact_phone } = req.body;
  if (!name || !code || !location || !capacity) {
    return res.status(400).json({ error: 'Name, Code, Location, and Capacity are required.' });
  }

  const existing = get(`SELECT id FROM warehouses WHERE code = ?`, [code]);
  if (existing) {
    return res.status(400).json({ error: `Warehouse with code '${code}' already exists.` });
  }

  const id = `wh-${Date.now()}`;
  run(`
    INSERT INTO warehouses (id, name, code, location, address, capacity, manager_name, contact_email, contact_phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `, [id, name, code.toUpperCase(), location, address || '', Number(capacity), manager_name || 'Unassigned', contact_email || '', contact_phone || '']);

  // Create zero-inventory rows for all existing products
  const products = query(`SELECT id FROM products`);
  for (const prod of products) {
    run(`
      INSERT OR IGNORE INTO inventory (id, product_id, warehouse_id, quantity, reserved_quantity, bin_location, last_audit_date)
      VALUES (?, ?, ?, 0, 0, 'AISLE-01-A-01', date('now'))
    `, [`inv-${prod.id}-${id}`, prod.id, id]);
  }

  logAudit('CREATE_WAREHOUSE', 'WAREHOUSE', id, `Created warehouse ${name} (${code})`, req.user.username);

  res.status(201).json({ message: 'Warehouse created successfully', id });
});

// PUT /api/warehouses/:id
router.put('/:id', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), (req, res) => {
  const { name, location, address, capacity, manager_name, contact_email, contact_phone, status } = req.body;
  const warehouse = get(`SELECT * FROM warehouses WHERE id = ?`, [req.params.id]);
  if (!warehouse) {
    return res.status(404).json({ error: 'Warehouse not found.' });
  }

  run(`
    UPDATE warehouses
    SET name = ?, location = ?, address = ?, capacity = ?, manager_name = ?, contact_email = ?, contact_phone = ?, status = ?
    WHERE id = ?
  `, [
    name || warehouse.name,
    location || warehouse.location,
    address || warehouse.address,
    capacity != null ? Number(capacity) : warehouse.capacity,
    manager_name || warehouse.manager_name,
    contact_email || warehouse.contact_email,
    contact_phone || warehouse.contact_phone,
    status || warehouse.status,
    req.params.id
  ]);

  logAudit('UPDATE_WAREHOUSE', 'WAREHOUSE', req.params.id, `Updated warehouse ${warehouse.code}`, req.user.username);

  res.json({ message: 'Warehouse updated successfully' });
});

module.exports = router;
