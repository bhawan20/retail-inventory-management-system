-- PostgreSQL DDL & Seed Script for Retail Inventory Management System (Capstone P_022)

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS agile_user_stories CASCADE;
DROP TABLE IF EXISTS agile_sprints CASCADE;
DROP TABLE IF EXISTS agile_epics CASCADE;
DROP TABLE IF EXISTS stock_adjustments CASCADE;
DROP TABLE IF EXISTS stock_transfers CASCADE;
DROP TABLE IF EXISTS sales_order_items CASCADE;
DROP TABLE IF EXISTS sales_orders CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT
);

CREATE TABLE warehouses (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  location VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  manager_name VARCHAR(150) NOT NULL,
  contact_email VARCHAR(150),
  contact_phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id VARCHAR(50) REFERENCES categories(id) ON DELETE SET NULL,
  barcode VARCHAR(50),
  unit_price NUMERIC(12, 2) NOT NULL,
  cost_price NUMERIC(12, 2) NOT NULL,
  reorder_point INTEGER NOT NULL,
  reorder_quantity INTEGER NOT NULL,
  unit_of_measure VARCHAR(50) DEFAULT 'Units',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  bin_location VARCHAR(50),
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  last_audit_date DATE,
  UNIQUE(product_id, warehouse_id)
);

CREATE TABLE suppliers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  contact_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  lead_time_days INTEGER NOT NULL DEFAULT 7,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.5,
  payment_terms VARCHAR(50) DEFAULT 'Net 30',
  status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE purchase_orders (
  id VARCHAR(50) PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id VARCHAR(50) NOT NULL REFERENCES suppliers(id),
  destination_warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  order_date DATE NOT NULL,
  expected_delivery DATE,
  received_date DATE,
  notes TEXT,
  created_by VARCHAR(100) NOT NULL
);

CREATE TABLE purchase_order_items (
  id VARCHAR(50) PRIMARY KEY,
  po_id VARCHAR(50) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER NOT NULL DEFAULT 0,
  unit_cost NUMERIC(12, 2) NOT NULL
);

CREATE TABLE sales_orders (
  id VARCHAR(50) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(150) NOT NULL,
  customer_email VARCHAR(150),
  customer_address TEXT,
  fulfillment_warehouse_id VARCHAR(50) REFERENCES warehouses(id),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(30) DEFAULT 'PAID',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  shipped_at TIMESTAMP WITH TIME ZONE,
  carrier VARCHAR(100),
  tracking_number VARCHAR(100)
);

CREATE TABLE sales_order_items (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL
);

CREATE TABLE stock_transfers (
  id VARCHAR(50) PRIMARY KEY,
  transfer_number VARCHAR(50) UNIQUE NOT NULL,
  source_warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
  dest_warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
  product_id VARCHAR(50) NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  initiated_by VARCHAR(100) NOT NULL,
  dispatched_at TIMESTAMP WITH TIME ZONE,
  received_at TIMESTAMP WITH TIME ZONE,
  tracking_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_adjustments (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL REFERENCES products(id),
  warehouse_id VARCHAR(50) NOT NULL REFERENCES warehouses(id),
  adjustment_type VARCHAR(50) NOT NULL,
  quantity_delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  performed_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
  id VARCHAR(50) PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(50),
  details TEXT,
  user_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agile_epics (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  business_value TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL,
  target_sprints VARCHAR(100) NOT NULL,
  progress_percent INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE agile_sprints (
  id VARCHAR(50) PRIMARY KEY,
  sprint_number INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  epic_id VARCHAR(50) REFERENCES agile_epics(id),
  goal TEXT NOT NULL,
  duration VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  velocity_points INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL
);

CREATE TABLE agile_user_stories (
  id VARCHAR(50) PRIMARY KEY,
  epic_id VARCHAR(50) NOT NULL REFERENCES agile_epics(id),
  sprint_id VARCHAR(50) NOT NULL REFERENCES agile_sprints(id),
  title VARCHAR(200) NOT NULL,
  user_role VARCHAR(100) NOT NULL,
  capability TEXT NOT NULL,
  benefit TEXT NOT NULL,
  acceptance_criteria TEXT NOT NULL,
  story_points INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'TO_DO',
  assignee_role VARCHAR(100) NOT NULL
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_prod_wh ON inventory(product_id, warehouse_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_transfers_status ON stock_transfers(status);
