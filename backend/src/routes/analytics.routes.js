const express = require('express');
const router = express.Router();
const { query, get } = require('../config/db');

// GET /api/analytics/overview
router.get('/overview', (req, res) => {
  // Inventory valuation & units
  const invStats = get(`
    SELECT 
      COALESCE(SUM(i.quantity * p.cost_price), 0) AS total_cost_value,
      COALESCE(SUM(i.quantity * p.unit_price), 0) AS total_retail_value,
      COALESCE(SUM(i.quantity), 0) AS total_units_in_stock,
      COALESCE(SUM(i.reserved_quantity), 0) AS total_reserved_units
    FROM inventory i
    JOIN products p ON i.product_id = p.id
  `);

  // Product stock status counts
  const productCounts = query(`
    SELECT 
      p.id,
      p.reorder_point,
      COALESCE(SUM(i.quantity), 0) AS total_quantity
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    GROUP BY p.id
  `);

  let outOfStockCount = 0;
  let lowStockCount = 0;
  for (const p of productCounts) {
    if (p.total_quantity === 0) {
      outOfStockCount++;
    } else if (p.total_quantity <= p.reorder_point) {
      lowStockCount++;
    }
  }

  // Active counts
  const warehousesCount = get(`SELECT COUNT(*) AS count FROM warehouses WHERE status = 'ACTIVE'`)?.count || 0;
  const suppliersCount = get(`SELECT COUNT(*) AS count FROM suppliers WHERE status = 'ACTIVE'`)?.count || 0;
  const openPosCount = get(`SELECT COUNT(*) AS count FROM purchase_orders WHERE status IN ('ORDERED', 'PARTIAL')`)?.count || 0;
  const pendingOrdersCount = get(`SELECT COUNT(*) AS count FROM sales_orders WHERE status IN ('PENDING', 'PICKING', 'PACKED')`)?.count || 0;
  const totalSalesRevenue = get(`SELECT COALESCE(SUM(total_amount), 0) AS total FROM sales_orders WHERE status != 'CANCELLED'`)?.total || 0;

  // Stock distribution by warehouse
  const warehouseDistribution = query(`
    SELECT 
      w.name,
      w.code,
      w.capacity,
      COALESCE(SUM(i.quantity), 0) AS units_stored,
      ROUND(COALESCE(SUM(i.quantity * p.cost_price), 0), 2) AS inventory_value
    FROM warehouses w
    LEFT JOIN inventory i ON w.id = i.warehouse_id
    LEFT JOIN products p ON i.product_id = p.id
    GROUP BY w.id
    ORDER BY units_stored DESC
  `);

  // Category breakdown
  const categoryBreakdown = query(`
    SELECT 
      c.name,
      COUNT(DISTINCT p.id) AS product_count,
      COALESCE(SUM(i.quantity), 0) AS total_units,
      ROUND(COALESCE(SUM(i.quantity * p.cost_price), 0), 2) AS category_value
    FROM categories c
    JOIN products p ON c.id = p.category_id
    LEFT JOIN inventory i ON p.id = i.product_id
    GROUP BY c.id
    ORDER BY category_value DESC
  `);

  // Monthly flow simulation/data
  const monthlyFlow = [
    { month: 'May 2026', inbound: 48000, outbound: 32000, net: 16000 },
    { month: 'Jun 2026', inbound: 52000, outbound: 41000, net: 11000 },
    { month: 'Jul 2026', inbound: 61000, outbound: 55000, net: 6000 },
    { month: 'Aug 2026', inbound: 58000, outbound: 62000, net: -4000 },
    { month: 'Sep 2026', inbound: 72000, outbound: 68000, net: 4000 },
    { month: 'Oct 2026', inbound: 85000, outbound: 74000, net: 11000 }
  ];

  // Recent activity logs
  const recentActivities = query(`
    SELECT * FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 10
  `);

  res.json({
    kpis: {
      total_cost_value: Math.round(invStats.total_cost_value * 100) / 100,
      total_retail_value: Math.round(invStats.total_retail_value * 100) / 100,
      potential_profit: Math.round((invStats.total_retail_value - invStats.total_cost_value) * 100) / 100,
      total_units_in_stock: invStats.total_units_in_stock,
      total_reserved_units: invStats.total_reserved_units,
      available_units: Math.max(0, invStats.total_units_in_stock - invStats.total_reserved_units),
      low_stock_count: lowStockCount,
      out_of_stock_count: outOfStockCount,
      warehouses_count: warehousesCount,
      suppliers_count: suppliersCount,
      open_pos_count: openPosCount,
      pending_orders_count: pendingOrdersCount,
      total_sales_revenue: Math.round(totalSalesRevenue * 100) / 100
    },
    warehouseDistribution,
    categoryBreakdown,
    monthlyFlow,
    recentActivities
  });
});

module.exports = router;
