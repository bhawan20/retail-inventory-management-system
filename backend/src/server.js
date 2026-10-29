const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('node:path');
require('dotenv').config();

const { initSchema } = require('./db/schema');
const { get } = require('./config/db');
const { seedDatabase } = require('./db/seed');

// Initialize database schema and auto-seed if empty
initSchema();
const countCheck = get(`SELECT COUNT(*) AS count FROM products`);
if (!countCheck || countCheck.count === 0) {
  console.log('[SERVER] Database appears empty. Seeding initial retail capstone dataset...');
  seedDatabase();
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route Handlers
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/warehouses', require('./routes/warehouses.routes'));
app.use('/api/inventory', require('./routes/inventory.routes'));
app.use('/api/transfers', require('./routes/transfers.routes'));
app.use('/api/suppliers', require('./routes/suppliers.routes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrders.routes'));
app.use('/api/sales-orders', require('./routes/salesOrders.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/agile', require('./routes/agile.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    project: 'Retail Inventory Management System',
    capstone: 'P_022 Agile Capstone Case Study',
    epics: 8,
    sprints: 15,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  Retail Inventory Management System API Server running on port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  Ready for Frontend & Agile Capstone Review`);
  console.log(`================================================================`);
});

module.exports = app;
