const express = require('express');
const router = express.Router();
const { query, get, run } = require('../config/db');
const { authenticate, authorize, logAudit } = require('../middleware/auth');

// GET /api/products
router.get('/', (req, res) => {
  const { search, category, warehouse, stock_status } = req.query;

  let sql = `
    SELECT 
      p.*,
      c.name AS category_name,
      COALESCE(SUM(i.quantity), 0) AS total_quantity,
      COALESCE(SUM(i.reserved_quantity), 0) AS total_reserved,
      COALESCE(SUM(i.quantity - i.reserved_quantity), 0) AS available_quantity
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN inventory i ON p.id = i.product_id
  `;

  const conditions = [];
  const params = [];

  if (warehouse) {
    conditions.push(`i.warehouse_id = ?`);
    params.push(warehouse);
  }

  if (category) {
    conditions.push(`p.category_id = ?`);
    params.push(category);
  }

  if (search) {
    conditions.push(`(p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`);
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  sql += ` GROUP BY p.id ORDER BY p.name ASC`;

  let products = query(sql, params);

  // Filter stock status if requested
  if (stock_status) {
    if (stock_status === 'OUT_OF_STOCK') {
      products = products.filter(p => p.total_quantity === 0);
    } else if (stock_status === 'LOW_STOCK') {
      products = products.filter(p => p.total_quantity > 0 && p.total_quantity <= p.reorder_point);
    } else if (stock_status === 'IN_STOCK') {
      products = products.filter(p => p.total_quantity > p.reorder_point);
    }
  }

  res.json({ products });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const product = get(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `, [req.params.id]);

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const warehouseInventory = query(`
    SELECT 
      i.*,
      w.name AS warehouse_name,
      w.code AS warehouse_code,
      w.location AS warehouse_location
    FROM inventory i
    JOIN warehouses w ON i.warehouse_id = w.id
    WHERE i.product_id = ?
    ORDER BY w.name ASC
  `, [req.params.id]);

  res.json({ product, warehouseInventory });
});

// POST /api/products
router.post('/', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), (req, res) => {
  const {
    sku,
    name,
    description,
    category_id,
    barcode,
    unit_price,
    cost_price,
    reorder_point,
    reorder_quantity,
    unit_of_measure,
    image_url,
    initial_allocations
  } = req.body;

  if (!sku || !name || unit_price == null || cost_price == null) {
    return res.status(400).json({ error: 'SKU, Product Name, Unit Price, and Cost Price are required.' });
  }

  const existing = get(`SELECT id FROM products WHERE sku = ?`, [sku]);
  if (existing) {
    return res.status(400).json({ error: `Product with SKU '${sku}' already exists.` });
  }

  const id = `prod-${Date.now()}`;
  run(`
    INSERT INTO products (id, sku, name, description, category_id, barcode, unit_price, cost_price, reorder_point, reorder_quantity, unit_of_measure, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    sku.trim().toUpperCase(),
    name.trim(),
    description || '',
    category_id || null,
    barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`,
    Number(unit_price),
    Number(cost_price),
    Number(reorder_point || 20),
    Number(reorder_quantity || 50),
    unit_of_measure || 'Units',
    image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
  ]);

  // Initialize inventory across warehouses
  const warehouses = query(`SELECT id FROM warehouses`);
  for (const wh of warehouses) {
    const qty = (initial_allocations && initial_allocations[wh.id]) ? Number(initial_allocations[wh.id]) : 0;
    const invId = `inv-${id}-${wh.id}`;
    run(`
      INSERT INTO inventory (id, product_id, warehouse_id, quantity, reserved_quantity, bin_location, last_audit_date)
      VALUES (?, ?, ?, ?, 0, 'AISLE-01-A-01', date('now'))
    `, [invId, id, wh.id, qty]);
  }

  logAudit('CREATE_PRODUCT', 'PRODUCT', id, `Created product ${name} (SKU: ${sku})`, req.user.username);

  res.status(201).json({ message: 'Product created successfully', id });
});

// PUT /api/products/:id
router.put('/:id', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), (req, res) => {
  const {
    name,
    description,
    category_id,
    barcode,
    unit_price,
    cost_price,
    reorder_point,
    reorder_quantity,
    unit_of_measure,
    image_url
  } = req.body;

  const product = get(`SELECT * FROM products WHERE id = ?`, [req.params.id]);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  run(`
    UPDATE products
    SET name = ?, description = ?, category_id = ?, barcode = ?, unit_price = ?, cost_price = ?, reorder_point = ?, reorder_quantity = ?, unit_of_measure = ?, image_url = ?
    WHERE id = ?
  `, [
    name || product.name,
    description !== undefined ? description : product.description,
    category_id !== undefined ? category_id : product.category_id,
    barcode || product.barcode,
    unit_price != null ? Number(unit_price) : product.unit_price,
    cost_price != null ? Number(cost_price) : product.cost_price,
    reorder_point != null ? Number(reorder_point) : product.reorder_point,
    reorder_quantity != null ? Number(reorder_quantity) : product.reorder_quantity,
    unit_of_measure || product.unit_of_measure,
    image_url || product.image_url,
    req.params.id
  ]);

  logAudit('UPDATE_PRODUCT', 'PRODUCT', req.params.id, `Updated product details for ${name || product.name}`, req.user.username);

  res.json({ message: 'Product updated successfully' });
});

// DELETE /api/products/:id
router.delete('/:id', authenticate, authorize('ADMIN'), (req, res) => {
  const product = get(`SELECT * FROM products WHERE id = ?`, [req.params.id]);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  run(`DELETE FROM inventory WHERE product_id = ?`, [req.params.id]);
  run(`DELETE FROM products WHERE id = ?`, [req.params.id]);

  logAudit('DELETE_PRODUCT', 'PRODUCT', req.params.id, `Deleted product ${product.name} (SKU: ${product.sku})`, req.user.username);

  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;
