const { exec } = require('../config/db');

function initSchema() {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      location TEXT NOT NULL,
      address TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      manager_name TEXT NOT NULL,
      contact_email TEXT,
      contact_phone TEXT,
      status TEXT DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      category_id TEXT REFERENCES categories(id),
      barcode TEXT,
      unit_price REAL NOT NULL,
      cost_price REAL NOT NULL,
      reorder_point INTEGER NOT NULL,
      reorder_quantity INTEGER NOT NULL,
      unit_of_measure TEXT DEFAULT 'Units',
      image_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      warehouse_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 0,
      bin_location TEXT,
      reserved_quantity INTEGER NOT NULL DEFAULT 0,
      last_audit_date TEXT,
      UNIQUE(product_id, warehouse_id)
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      lead_time_days INTEGER NOT NULL DEFAULT 7,
      rating REAL NOT NULL DEFAULT 4.5,
      payment_terms TEXT DEFAULT 'Net 30',
      status TEXT DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      po_number TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL REFERENCES suppliers(id),
      destination_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
      status TEXT NOT NULL DEFAULT 'DRAFT',
      total_amount REAL NOT NULL DEFAULT 0,
      order_date TEXT NOT NULL,
      expected_delivery TEXT,
      received_date TEXT,
      notes TEXT,
      created_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id TEXT PRIMARY KEY,
      po_id TEXT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity_ordered INTEGER NOT NULL,
      quantity_received INTEGER NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sales_orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_address TEXT,
      fulfillment_warehouse_id TEXT REFERENCES warehouses(id),
      status TEXT NOT NULL DEFAULT 'PENDING',
      total_amount REAL NOT NULL DEFAULT 0,
      payment_status TEXT DEFAULT 'PAID',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      shipped_at TEXT,
      carrier TEXT,
      tracking_number TEXT
    );

    CREATE TABLE IF NOT EXISTS sales_order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_transfers (
      id TEXT PRIMARY KEY,
      transfer_number TEXT UNIQUE NOT NULL,
      source_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
      dest_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      initiated_by TEXT NOT NULL,
      dispatched_at TEXT,
      received_at TEXT,
      tracking_notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id),
      warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
      adjustment_type TEXT NOT NULL,
      quantity_delta INTEGER NOT NULL,
      reason TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      user_name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS agile_epics (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      business_value TEXT NOT NULL,
      priority TEXT NOT NULL,
      target_sprints TEXT NOT NULL,
      progress_percent INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS agile_sprints (
      id TEXT PRIMARY KEY,
      sprint_number INTEGER NOT NULL,
      name TEXT NOT NULL,
      epic_id TEXT REFERENCES agile_epics(id),
      goal TEXT NOT NULL,
      duration TEXT NOT NULL,
      status TEXT NOT NULL,
      velocity_points INTEGER NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS agile_user_stories (
      id TEXT PRIMARY KEY,
      epic_id TEXT NOT NULL REFERENCES agile_epics(id),
      sprint_id TEXT NOT NULL REFERENCES agile_sprints(id),
      title TEXT NOT NULL,
      user_role TEXT NOT NULL,
      capability TEXT NOT NULL,
      benefit TEXT NOT NULL,
      acceptance_criteria TEXT NOT NULL,
      story_points INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'TO_DO',
      assignee_role TEXT NOT NULL
    );
  `;

  exec(schemaSql);
  console.log('[DB] Schema initialized successfully.');
}

module.exports = { initSchema };
