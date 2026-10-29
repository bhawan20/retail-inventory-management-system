const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

// GET /api/suppliers
router.get('/', (req, res) => {
  const suppliers = query(`
    SELECT 
      s.*,
      COUNT(po.id) AS total_orders_count,
      COUNT(CASE WHEN po.status IN ('ORDERED', 'PARTIAL') THEN 1 END) AS active_orders_count
    FROM suppliers s
    LEFT JOIN purchase_orders po ON s.id = po.supplier_id
    GROUP BY s.id
    ORDER BY s.name ASC
  `);

  res.json({ suppliers });
});

// GET /api/suppliers/:id
router.get('/:id', (req, res) => {
  const supplier = get(`SELECT * FROM suppliers WHERE id = ?`, [req.params.id]);
  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found.' });
  }

  const purchaseOrders = query(`
    SELECT po.*, w.name AS destination_warehouse_name
    FROM purchase_orders po
    JOIN warehouses w ON po.destination_warehouse_id = w.id
    WHERE po.supplier_id = ?
    ORDER BY po.order_date DESC
  `, [req.params.id]);

  res.json({ supplier, purchaseOrders });
});

// POST /api/suppliers
router.post('/', authenticate, authorize('ADMIN', 'PROCUREMENT_MANAGER'), (req, res) => {
  const { name, code, contact_name, email, phone, address, lead_time_days, rating, payment_terms } = req.body;
  if (!name || !contact_name || !email) {
    return res.status(400).json({ error: 'Company Name, Contact Name, and Email are required.' });
  }

  const generatedCode = code ? code.toUpperCase() : `SUP-${name.substring(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
  const existing = get(`SELECT id FROM suppliers WHERE code = ?`, [generatedCode]);
  if (existing) {
    return res.status(400).json({ error: `Supplier with code '${generatedCode}' already exists.` });
  }

  const id = `sup-${Date.now()}`;
  run(`
    INSERT INTO suppliers (id, name, code, contact_name, email, phone, address, lead_time_days, rating, payment_terms, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `, [id, name, generatedCode, contact_name, email, phone || '', address || '', Number(lead_time_days || 7), Number(rating || 4.5), payment_terms || 'Net 30']);

  logAudit('CREATE_SUPPLIER', 'SUPPLIER', id, `Created supplier ${name} (${generatedCode})`, req.user.username);

  res.status(201).json({ message: 'Supplier created successfully', id });
});

// PUT /api/suppliers/:id
router.put('/:id', authenticate, authorize('ADMIN', 'PROCUREMENT_MANAGER'), (req, res) => {
  const { name, contact_name, email, phone, address, lead_time_days, rating, payment_terms, status } = req.body;
  const supplier = get(`SELECT * FROM suppliers WHERE id = ?`, [req.params.id]);
  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found.' });
  }

  run(`
    UPDATE suppliers
    SET name = ?, contact_name = ?, email = ?, phone = ?, address = ?, lead_time_days = ?, rating = ?, payment_terms = ?, status = ?
    WHERE id = ?
  `, [
    name || supplier.name,
    contact_name || supplier.contact_name,
    email || supplier.email,
    phone || supplier.phone,
    address || supplier.address,
    lead_time_days != null ? Number(lead_time_days) : supplier.lead_time_days,
    rating != null ? Number(rating) : supplier.rating,
    payment_terms || supplier.payment_terms,
    status || supplier.status,
    req.params.id
  ]);

  logAudit('UPDATE_SUPPLIER', 'SUPPLIER', req.params.id, `Updated supplier ${supplier.name}`, req.user.username);

  res.json({ message: 'Supplier updated successfully' });
});

module.exports = router;
