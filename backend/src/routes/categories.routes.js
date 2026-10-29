const express = require('express');
const router = express.Router();
const { query, run } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/categories
router.get('/', (req, res) => {
  const categories = query(`
    SELECT c.*, COUNT(p.id) AS product_count
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  res.json({ categories });
});

// POST /api/categories
router.post('/', authenticate, authorize('ADMIN', 'WAREHOUSE_MANAGER'), (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Category name is required.' });
  }

  const id = `cat-${Date.now()}`;
  run(`INSERT INTO categories (id, name, description) VALUES (?, ?, ?)`, [id, name, description || '']);
  res.status(201).json({ message: 'Category created', id });
});

module.exports = router;
