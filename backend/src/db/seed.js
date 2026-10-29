const bcrypt = require('bcryptjs');
const { initSchema } = require('./schema');
const { run, query } = require('../config/db');

function seedDatabase() {
  console.log('[SEED] Starting database initialization and seeding...');
  initSchema();

  // 1. Users
  const passwordHash = bcrypt.hashSync('password123', 10);
  const users = [
    { id: 'usr-1', username: 'admin', email: 'admin@retailhub.com', role: 'ADMIN', full_name: 'Alex Morgan (System Administrator)' },
    { id: 'usr-2', username: 'wh_manager', email: 'marcus.wh@retailhub.com', role: 'WAREHOUSE_MANAGER', full_name: 'Marcus Vance (Regional Warehouse Director)' },
    { id: 'usr-3', username: 'inventory_clerk', email: 'clerk.sarah@retailhub.com', role: 'INVENTORY_CLERK', full_name: 'Sarah Jenkins (Lead Inventory Specialist)' },
    { id: 'usr-4', username: 'procurement', email: 'buyer.david@retailhub.com', role: 'PROCUREMENT_MANAGER', full_name: 'David Chen (Procurement & Vendor Manager)' },
    { id: 'usr-5', username: 'sales_rep', email: 'sales.emily@retailhub.com', role: 'SALES_REP', full_name: 'Emily Watson (Order Fulfillment Lead)' }
  ];

  for (const u of users) {
    run(
      `INSERT OR REPLACE INTO users (id, username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.id, u.username, u.email, passwordHash, u.role, u.full_name]
    );
  }

  // 2. Categories
  const categories = [
    { id: 'cat-1', name: 'Electronics & Computing', description: 'Laptops, tablets, smart devices, and high-performance computing accessories' },
    { id: 'cat-2', name: 'Apparel & Footwear', description: 'Sustainable clothing, athletic wear, and premium outdoor footwear' },
    { id: 'cat-3', name: 'Home & Kitchen', description: 'Smart appliances, modern furniture, and barista-grade coffee equipment' },
    { id: 'cat-4', name: 'Sports & Fitness', description: 'Cardio equipment, yoga gear, GPS trackers, and trail accessories' },
    { id: 'cat-5', name: 'Health & Personal Care', description: 'Ergonomic supports, ambient wellness, and daily grooming devices' }
  ];

  for (const c of categories) {
    run(
      `INSERT OR REPLACE INTO categories (id, name, description) VALUES (?, ?, ?)`,
      [c.id, c.name, c.description]
    );
  }

  // 3. Warehouses
  const warehouses = [
    {
      id: 'wh-1',
      name: 'Central Distribution Hub (Chicago)',
      code: 'WH-CHI-01',
      location: 'Chicago, IL',
      address: '4200 S Pulaski Rd, Chicago, IL 60632',
      capacity: 120000,
      manager_name: 'Marcus Vance',
      contact_email: 'chicago.wh@retailhub.com',
      contact_phone: '+1 (312) 555-0142',
      status: 'ACTIVE'
    },
    {
      id: 'wh-2',
      name: 'East Coast Logistics Center (New Jersey)',
      code: 'WH-NJ-02',
      location: 'Newark, NJ',
      address: '1000 Logistics Way, Newark, NJ 07114',
      capacity: 85000,
      manager_name: 'Helena Rodriguez',
      contact_email: 'newjersey.wh@retailhub.com',
      contact_phone: '+1 (973) 555-0189',
      status: 'ACTIVE'
    },
    {
      id: 'wh-3',
      name: 'Pacific West Coast Hub (California)',
      code: 'WH-CA-03',
      location: 'Oakland, CA',
      address: '8800 San Leandro St, Oakland, CA 94621',
      capacity: 95000,
      manager_name: 'Kevin Park',
      contact_email: 'oakland.wh@retailhub.com',
      contact_phone: '+1 (510) 555-0112',
      status: 'ACTIVE'
    },
    {
      id: 'wh-4',
      name: 'Southern Regional Depot (Dallas)',
      code: 'WH-TX-04',
      location: 'Dallas, TX',
      address: '3300 Pinnacle Point Dr, Dallas, TX 75211',
      capacity: 70000,
      manager_name: 'Tanya Brooks',
      contact_email: 'dallas.wh@retailhub.com',
      contact_phone: '+1 (214) 555-0177',
      status: 'ACTIVE'
    }
  ];

  for (const w of warehouses) {
    run(
      `INSERT OR REPLACE INTO warehouses (id, name, code, location, address, capacity, manager_name, contact_email, contact_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [w.id, w.name, w.code, w.location, w.address, w.capacity, w.manager_name, w.contact_email, w.contact_phone, w.status]
    );
  }

  // 4. Suppliers
  const suppliers = [
    {
      id: 'sup-1',
      name: 'Apex Silicon Tech Global',
      code: 'SUP-APEX-01',
      contact_name: 'Arthur Sterling',
      email: 'orders@apexsilicon.com',
      phone: '+1 (408) 555-9011',
      address: '100 Innovation Way, San Jose, CA',
      lead_time_days: 8,
      rating: 4.9,
      payment_terms: 'Net 30',
      status: 'ACTIVE'
    },
    {
      id: 'sup-2',
      name: 'Vanguard Organic Apparel Ltd',
      code: 'SUP-VANG-02',
      contact_name: 'Clara Oswald',
      email: 'supply@vanguardtextiles.com',
      phone: '+1 (704) 555-8241',
      address: '45 Industrial Ave, Charlotte, NC',
      lead_time_days: 6,
      rating: 4.7,
      payment_terms: 'Net 45',
      status: 'ACTIVE'
    },
    {
      id: 'sup-3',
      name: 'Nordic Craft Furniture & Home',
      code: 'SUP-NORD-03',
      contact_name: 'Bjorn Lindqvist',
      email: 'b2b@nordichome.se',
      phone: '+1 (503) 555-4309',
      address: '820 NW 13th Ave, Portland, OR',
      lead_time_days: 14,
      rating: 4.8,
      payment_terms: 'Net 60',
      status: 'ACTIVE'
    },
    {
      id: 'sup-4',
      name: 'Titan Pro Sports Equipment',
      code: 'SUP-TITN-04',
      contact_name: 'Derrick Miller',
      email: 'sales@titansports.com',
      phone: '+1 (303) 555-6712',
      address: '1500 Mountain View Rd, Denver, CO',
      lead_time_days: 5,
      rating: 4.5,
      payment_terms: 'Net 30',
      status: 'ACTIVE'
    }
  ];

  for (const s of suppliers) {
    run(
      `INSERT OR REPLACE INTO suppliers (id, name, code, contact_name, email, phone, address, lead_time_days, rating, payment_terms, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.name, s.code, s.contact_name, s.email, s.phone, s.address, s.lead_time_days, s.rating, s.payment_terms, s.status]
    );
  }

  // 5. Products
  const products = [
    {
      id: 'prod-1',
      sku: 'ELEC-NB-15PRO',
      name: 'Ultrabook Pro 15.6" M2-Silicon',
      description: '32GB RAM, 1TB NVMe SSD, Liquid Retina Display with Anti-Glare coating',
      category_id: 'cat-1',
      barcode: '890123450001',
      unit_price: 1499.00,
      cost_price: 980.00,
      reorder_point: 20,
      reorder_quantity: 50,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80'
    },
    {
      id: 'prod-2',
      sku: 'ELEC-HP-ANC90',
      name: 'AcousticPro Wireless ANC Headphones',
      description: 'Adaptive Hybrid Active Noise Cancelling, 45-hour battery life, lossless audio',
      category_id: 'cat-1',
      barcode: '890123450002',
      unit_price: 279.00,
      cost_price: 135.00,
      reorder_point: 30,
      reorder_quantity: 100,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
    },
    {
      id: 'prod-3',
      sku: 'ELEC-SW-V6GPS',
      name: 'Apex Smartwatch GPS Titanium v6',
      description: 'Biometric ECG, SpO2 sensor, sapphire crystal glass, 100m water resistant',
      category_id: 'cat-1',
      barcode: '890123450003',
      unit_price: 349.00,
      cost_price: 190.00,
      reorder_point: 25,
      reorder_quantity: 75,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
    },
    {
      id: 'prod-4',
      sku: 'APPR-TEE-OGCRW',
      name: 'Organic Combed Cotton Crewneck T-Shirt',
      description: '100% GOTS certified ring-spun organic cotton, pre-shrunk, breathable weave',
      category_id: 'cat-2',
      barcode: '890123450004',
      unit_price: 34.00,
      cost_price: 12.50,
      reorder_point: 100,
      reorder_quantity: 300,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&q=80'
    },
    {
      id: 'prod-5',
      sku: 'APPR-SH-TRL70',
      name: 'All-Terrain Vibram Trail Running Shoes',
      description: 'Waterproof ripstop membrane, Vibram Megagrip lug outsole, responsive foam',
      category_id: 'cat-2',
      barcode: '890123450005',
      unit_price: 155.00,
      cost_price: 72.00,
      reorder_point: 40,
      reorder_quantity: 120,
      unit_of_measure: 'Pairs',
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'
    },
    {
      id: 'prod-6',
      sku: 'HOME-CHR-ERGOM',
      name: 'ErgoWave Executive Mesh Task Chair',
      description: 'Dynamic lumbar support, 4D armrests, breathable Korean elastomer mesh',
      category_id: 'cat-3',
      barcode: '890123450006',
      unit_price: 489.00,
      cost_price: 240.00,
      reorder_point: 15,
      reorder_quantity: 40,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1580481077195-c328ad4f4453?w=500&q=80'
    },
    {
      id: 'prod-7',
      sku: 'HOME-COF-PRSS8',
      name: 'Double-Wall Stainless Thermal French Press',
      description: '34oz 18/10 stainless steel, dual-micro filtration system, 4-hour heat lock',
      category_id: 'cat-3',
      barcode: '890123450007',
      unit_price: 68.00,
      cost_price: 28.00,
      reorder_point: 35,
      reorder_quantity: 100,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80'
    },
    {
      id: 'prod-8',
      sku: 'SPRT-YOG-PRM06',
      name: 'ProGrip High-Density Natural Rubber Yoga Mat',
      description: '6mm eco-polyurethane surface, non-slip laser alignment lines, anti-odor',
      category_id: 'cat-4',
      barcode: '890123450008',
      unit_price: 84.00,
      cost_price: 36.00,
      reorder_point: 45,
      reorder_quantity: 120,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&q=80'
    },
    {
      id: 'prod-9',
      sku: 'SPRT-VST-HYD12',
      name: 'Ultralight 12L Trail Hydration Vest',
      description: 'Dual 500ml soft flasks included, pole attachments, emergency safety whistle',
      category_id: 'cat-4',
      barcode: '890123450009',
      unit_price: 119.00,
      cost_price: 52.00,
      reorder_point: 25,
      reorder_quantity: 80,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'
    },
    {
      id: 'prod-10',
      sku: 'ELEC-KB-MECH87',
      name: 'Tactile Wireless Low-Profile Mechanical Keyboard',
      description: 'CNC aluminum chassis, hot-swappable tactile switches, multi-device Bluetooth 5.3',
      category_id: 'cat-1',
      barcode: '890123450010',
      unit_price: 169.00,
      cost_price: 82.00,
      reorder_point: 20,
      reorder_quantity: 60,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80'
    },
    {
      id: 'prod-11',
      sku: 'HLTH-LMP-SMT22',
      name: 'Circadian Smart Ambient Desk Lamp',
      description: 'Full spectrum 98 CRI LED, auto-dimming ambient sensor, wireless phone charging base',
      category_id: 'cat-5',
      barcode: '890123450011',
      unit_price: 129.00,
      cost_price: 61.00,
      reorder_point: 20,
      reorder_quantity: 50,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80'
    },
    {
      id: 'prod-12',
      sku: 'ELEC-CAM-ACT4K',
      name: 'HyperView 4K/60fps Waterproof Action Cam',
      description: '6-axis gyro stabilization, dual color displays, 20MP sensor with voice command',
      category_id: 'cat-1',
      barcode: '890123450012',
      unit_price: 299.00,
      cost_price: 160.00,
      reorder_point: 15,
      reorder_quantity: 45,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&q=80'
    }
  ];

  for (const p of products) {
    run(
      `INSERT OR REPLACE INTO products (id, sku, name, description, category_id, barcode, unit_price, cost_price, reorder_point, reorder_quantity, unit_of_measure, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.sku, p.name, p.description, p.category_id, p.barcode, p.unit_price, p.cost_price, p.reorder_point, p.reorder_quantity, p.unit_of_measure, p.image_url]
    );
  }

  // 6. Inventory Levels (realistic distribution across 4 warehouses)
  const stockAllocations = [
    // prod-1: Laptop
    { id: 'inv-1', prod: 'prod-1', wh: 'wh-1', qty: 45, reserved: 3, bin: 'AISLE-01-A-12' },
    { id: 'inv-2', prod: 'prod-1', wh: 'wh-2', qty: 18, reserved: 2, bin: 'AISLE-02-B-04' }, // LOW STOCK! (Threshold 20)
    { id: 'inv-3', prod: 'prod-1', wh: 'wh-3', qty: 32, reserved: 1, bin: 'AISLE-01-A-09' },
    { id: 'inv-4', prod: 'prod-1', wh: 'wh-4', qty: 8, reserved: 0, bin: 'AISLE-03-C-15' }, // CRITICAL LOW STOCK!

    // prod-2: Headphones
    { id: 'inv-5', prod: 'prod-2', wh: 'wh-1', qty: 110, reserved: 8, bin: 'AISLE-01-B-01' },
    { id: 'inv-6', prod: 'prod-2', wh: 'wh-2', qty: 65, reserved: 4, bin: 'AISLE-02-C-11' },
    { id: 'inv-7', prod: 'prod-2', wh: 'wh-3', qty: 85, reserved: 2, bin: 'AISLE-01-D-02' },
    { id: 'inv-8', prod: 'prod-2', wh: 'wh-4', qty: 22, reserved: 5, bin: 'AISLE-03-B-08' }, // LOW STOCK! (Threshold 30)

    // prod-3: Smartwatch
    { id: 'inv-9', prod: 'prod-3', wh: 'wh-1', qty: 70, reserved: 4, bin: 'AISLE-01-C-05' },
    { id: 'inv-10', prod: 'prod-3', wh: 'wh-2', qty: 42, reserved: 0, bin: 'AISLE-02-A-14' },
    { id: 'inv-11', prod: 'prod-3', wh: 'wh-3', qty: 55, reserved: 3, bin: 'AISLE-01-B-07' },
    { id: 'inv-12', prod: 'prod-3', wh: 'wh-4', qty: 0, reserved: 0, bin: 'AISLE-03-A-01' }, // OUT OF STOCK!

    // prod-4: T-Shirt
    { id: 'inv-13', prod: 'prod-4', wh: 'wh-1', qty: 380, reserved: 15, bin: 'AISLE-04-A-01' },
    { id: 'inv-14', prod: 'prod-4', wh: 'wh-2', qty: 240, reserved: 10, bin: 'AISLE-04-B-02' },
    { id: 'inv-15', prod: 'prod-4', wh: 'wh-3', qty: 310, reserved: 8, bin: 'AISLE-04-C-03' },
    { id: 'inv-16', prod: 'prod-4', wh: 'wh-4', qty: 190, reserved: 12, bin: 'AISLE-04-D-04' },

    // prod-5: Trail Running Shoes
    { id: 'inv-17', prod: 'prod-5', wh: 'wh-1', qty: 95, reserved: 4, bin: 'AISLE-05-A-10' },
    { id: 'inv-18', prod: 'prod-5', wh: 'wh-2', qty: 62, reserved: 3, bin: 'AISLE-05-B-11' },
    { id: 'inv-19', prod: 'prod-5', wh: 'wh-3', qty: 80, reserved: 2, bin: 'AISLE-05-C-12' },
    { id: 'inv-20', prod: 'prod-5', wh: 'wh-4', qty: 35, reserved: 1, bin: 'AISLE-05-D-13' }, // LOW STOCK!

    // prod-6: Ergo Chair
    { id: 'inv-21', prod: 'prod-6', wh: 'wh-1', qty: 28, reserved: 2, bin: 'BULK-PALLET-01' },
    { id: 'inv-22', prod: 'prod-6', wh: 'wh-2', qty: 19, reserved: 1, bin: 'BULK-PALLET-02' },
    { id: 'inv-23', prod: 'prod-6', wh: 'wh-3', qty: 24, reserved: 0, bin: 'BULK-PALLET-03' },
    { id: 'inv-24', prod: 'prod-6', wh: 'wh-4', qty: 12, reserved: 1, bin: 'BULK-PALLET-04' }, // LOW STOCK!

    // prod-7: French Press
    { id: 'inv-25', prod: 'prod-7', wh: 'wh-1', qty: 120, reserved: 5, bin: 'AISLE-06-A-01' },
    { id: 'inv-26', prod: 'prod-7', wh: 'wh-2', qty: 85, reserved: 3, bin: 'AISLE-06-B-02' },
    { id: 'inv-27', prod: 'prod-7', wh: 'wh-3', qty: 90, reserved: 2, bin: 'AISLE-06-C-03' },
    { id: 'inv-28', prod: 'prod-7', wh: 'wh-4', qty: 64, reserved: 1, bin: 'AISLE-06-D-04' },

    // prod-8: Yoga Mat
    { id: 'inv-29', prod: 'prod-8', wh: 'wh-1', qty: 140, reserved: 6, bin: 'AISLE-07-A-05' },
    { id: 'inv-30', prod: 'prod-8', wh: 'wh-2', qty: 90, reserved: 4, bin: 'AISLE-07-B-06' },
    { id: 'inv-31', prod: 'prod-8', wh: 'wh-3', qty: 110, reserved: 3, bin: 'AISLE-07-C-07' },
    { id: 'inv-32', prod: 'prod-8', wh: 'wh-4', qty: 40, reserved: 2, bin: 'AISLE-07-D-08' }, // LOW STOCK!

    // prod-9: Hydration Vest
    { id: 'inv-33', prod: 'prod-9', wh: 'wh-1', qty: 75, reserved: 3, bin: 'AISLE-07-E-01' },
    { id: 'inv-34', prod: 'prod-9', wh: 'wh-2', qty: 50, reserved: 2, bin: 'AISLE-07-E-02' },
    { id: 'inv-35', prod: 'prod-9', wh: 'wh-3', qty: 60, reserved: 1, bin: 'AISLE-07-E-03' },
    { id: 'inv-36', prod: 'prod-9', wh: 'wh-4', qty: 18, reserved: 0, bin: 'AISLE-07-E-04' }, // LOW STOCK!

    // prod-10: Keyboard
    { id: 'inv-37', prod: 'prod-10', wh: 'wh-1', qty: 55, reserved: 2, bin: 'AISLE-01-E-09' },
    { id: 'inv-38', prod: 'prod-10', wh: 'wh-2', qty: 40, reserved: 1, bin: 'AISLE-02-E-10' },
    { id: 'inv-39', prod: 'prod-10', wh: 'wh-3', qty: 48, reserved: 3, bin: 'AISLE-01-E-11' },
    { id: 'inv-40', prod: 'prod-10', wh: 'wh-4', qty: 16, reserved: 0, bin: 'AISLE-03-E-12' }, // LOW STOCK!

    // prod-11: Smart Lamp
    { id: 'inv-41', prod: 'prod-11', wh: 'wh-1', qty: 65, reserved: 1, bin: 'AISLE-08-A-01' },
    { id: 'inv-42', prod: 'prod-11', wh: 'wh-2', qty: 45, reserved: 2, bin: 'AISLE-08-B-02' },
    { id: 'inv-43', prod: 'prod-11', wh: 'wh-3', qty: 52, reserved: 0, bin: 'AISLE-08-C-03' },
    { id: 'inv-44', prod: 'prod-11', wh: 'wh-4', qty: 30, reserved: 1, bin: 'AISLE-08-D-04' },

    // prod-12: Action Cam
    { id: 'inv-45', prod: 'prod-12', wh: 'wh-1', qty: 42, reserved: 2, bin: 'AISLE-01-F-01' },
    { id: 'inv-46', prod: 'prod-12', wh: 'wh-2', qty: 28, reserved: 1, bin: 'AISLE-02-F-02' },
    { id: 'inv-47', prod: 'prod-12', wh: 'wh-3', qty: 35, reserved: 2, bin: 'AISLE-01-F-03' },
    { id: 'inv-48', prod: 'prod-12', wh: 'wh-4', qty: 11, reserved: 0, bin: 'AISLE-03-F-04' } // LOW STOCK!
  ];

  for (const inv of stockAllocations) {
    run(
      `INSERT OR REPLACE INTO inventory (id, product_id, warehouse_id, quantity, reserved_quantity, bin_location, last_audit_date)
       VALUES (?, ?, ?, ?, ?, ?, date('now', '-5 days'))`,
      [inv.id, inv.prod, inv.wh, inv.qty, inv.reserved, inv.bin]
    );
  }

  // 7. Purchase Orders
  const pos = [
    {
      id: 'po-1',
      po_number: 'PO-2026-101',
      supplier_id: 'sup-1',
      destination_warehouse_id: 'wh-1',
      status: 'RECEIVED',
      total_amount: 49000.00,
      order_date: '2026-10-10',
      expected_delivery: '2026-10-18',
      received_date: '2026-10-18',
      notes: 'Initial Q4 restocking for flagship ultrabooks',
      created_by: 'David Chen'
    },
    {
      id: 'po-2',
      po_number: 'PO-2026-102',
      supplier_id: 'sup-1',
      destination_warehouse_id: 'wh-4',
      status: 'ORDERED',
      total_amount: 14250.00,
      order_date: '2026-10-22',
      expected_delivery: '2026-10-30',
      received_date: null,
      notes: 'Replenishing Dallas warehouse out-of-stock smartwatches',
      created_by: 'David Chen'
    },
    {
      id: 'po-3',
      po_number: 'PO-2026-103',
      supplier_id: 'sup-2',
      destination_warehouse_id: 'wh-2',
      status: 'DRAFT',
      total_amount: 3750.00,
      order_date: '2026-10-28',
      expected_delivery: '2026-11-04',
      received_date: null,
      notes: 'Seasonal organic crewneck replenishment draft',
      created_by: 'David Chen'
    }
  ];

  for (const po of pos) {
    run(
      `INSERT OR REPLACE INTO purchase_orders (id, po_number, supplier_id, destination_warehouse_id, status, total_amount, order_date, expected_delivery, received_date, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [po.id, po.po_number, po.supplier_id, po.destination_warehouse_id, po.status, po.total_amount, po.order_date, po.expected_delivery, po.received_date, po.notes, po.created_by]
    );
  }

  // PO Items
  run(`INSERT OR REPLACE INTO purchase_order_items (id, po_id, product_id, quantity_ordered, quantity_received, unit_cost) VALUES (?, ?, ?, ?, ?, ?)`,
    ['poi-1', 'po-1', 'prod-1', 50, 50, 980.00]
  );
  run(`INSERT OR REPLACE INTO purchase_order_items (id, po_id, product_id, quantity_ordered, quantity_received, unit_cost) VALUES (?, ?, ?, ?, ?, ?)`,
    ['poi-2', 'po-2', 'prod-3', 75, 0, 190.00]
  );
  run(`INSERT OR REPLACE INTO purchase_order_items (id, po_id, product_id, quantity_ordered, quantity_received, unit_cost) VALUES (?, ?, ?, ?, ?, ?)`,
    ['poi-3', 'po-3', 'prod-4', 300, 0, 12.50]
  );

  // 8. Sales Orders
  const salesOrders = [
    {
      id: 'so-1',
      order_number: 'SO-2026-801',
      customer_name: 'Metro Corporate Solutions',
      customer_email: 'procure@metrocorp.com',
      customer_address: '500 W Madison St, Suite 200, Chicago, IL',
      fulfillment_warehouse_id: 'wh-1',
      status: 'DELIVERED',
      total_amount: 7495.00,
      payment_status: 'PAID',
      created_at: '2026-10-20 14:30:00',
      shipped_at: '2026-10-21 09:00:00',
      carrier: 'FedEx Priority',
      tracking_number: 'FX-982103847291'
    },
    {
      id: 'so-2',
      order_number: 'SO-2026-802',
      customer_name: 'Bay Area Athletic Club',
      customer_email: 'inventory@bayathletic.org',
      customer_address: '1200 Market St, San Francisco, CA',
      fulfillment_warehouse_id: 'wh-3',
      status: 'SHIPPED',
      total_amount: 1475.00,
      payment_status: 'PAID',
      created_at: '2026-10-24 11:15:00',
      shipped_at: '2026-10-25 16:45:00',
      carrier: 'UPS Ground',
      tracking_number: '1Z9999999999999999'
    },
    {
      id: 'so-3',
      order_number: 'SO-2026-803',
      customer_name: 'Dr. Rebecca Simmons',
      customer_email: 'rebecca.simmons@healthmed.net',
      customer_address: '77 Central Park West, New York, NY',
      fulfillment_warehouse_id: 'wh-2',
      status: 'PACKED',
      total_amount: 1047.00,
      payment_status: 'PAID',
      created_at: '2026-10-27 10:00:00',
      shipped_at: null,
      carrier: 'USPS Priority',
      tracking_number: null
    },
    {
      id: 'so-4',
      order_number: 'SO-2026-804',
      customer_name: 'Summit Tech Incubator',
      customer_email: 'admin@summitincubator.io',
      customer_address: '2100 Ross Ave, Dallas, TX',
      fulfillment_warehouse_id: 'wh-4',
      status: 'PENDING',
      total_amount: 2998.00,
      payment_status: 'PENDING',
      created_at: '2026-10-28 15:40:00',
      shipped_at: null,
      carrier: null,
      tracking_number: null
    }
  ];

  for (const so of salesOrders) {
    run(
      `INSERT OR REPLACE INTO sales_orders (id, order_number, customer_name, customer_email, customer_address, fulfillment_warehouse_id, status, total_amount, payment_status, created_at, shipped_at, carrier, tracking_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [so.id, so.order_number, so.customer_name, so.customer_email, so.customer_address, so.fulfillment_warehouse_id, so.status, so.total_amount, so.payment_status, so.created_at, so.shipped_at, so.carrier, so.tracking_number]
    );
  }

  // Sales Order Items
  run(`INSERT OR REPLACE INTO sales_order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
    ['soi-1', 'so-1', 'prod-1', 5, 1499.00]
  );
  run(`INSERT OR REPLACE INTO sales_order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
    ['soi-2', 'so-2', 'prod-5', 5, 155.00]
  );
  run(`INSERT OR REPLACE INTO sales_order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
    ['soi-3', 'so-2', 'prod-8', 5, 84.00]
  );
  run(`INSERT OR REPLACE INTO sales_order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
    ['soi-4', 'so-3', 'prod-2', 2, 279.00]
  );
  run(`INSERT OR REPLACE INTO sales_order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
    ['soi-5', 'so-3', 'prod-6', 1, 489.00]
  );
  run(`INSERT OR REPLACE INTO sales_order_items (id, order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?, ?)`,
    ['soi-6', 'so-4', 'prod-1', 2, 1499.00]
  );

  // 9. Stock Transfers
  const transfers = [
    {
      id: 'trf-1',
      transfer_number: 'TRF-2026-001',
      source_warehouse_id: 'wh-1',
      dest_warehouse_id: 'wh-2',
      product_id: 'prod-1',
      quantity: 15,
      status: 'RECEIVED',
      initiated_by: 'Marcus Vance',
      dispatched_at: '2026-10-15 08:30:00',
      received_at: '2026-10-17 14:10:00',
      tracking_notes: 'Rebalanced high-demand laptops for East Coast enterprise accounts'
    },
    {
      id: 'trf-2',
      transfer_number: 'TRF-2026-002',
      source_warehouse_id: 'wh-1',
      dest_warehouse_id: 'wh-4',
      product_id: 'prod-2',
      quantity: 20,
      status: 'IN_TRANSIT',
      initiated_by: 'Sarah Jenkins',
      dispatched_at: '2026-10-27 10:00:00',
      received_at: null,
      tracking_notes: 'Interstate freight dispatch via Swift Logistics Truck #881'
    },
    {
      id: 'trf-3',
      transfer_number: 'TRF-2026-003',
      source_warehouse_id: 'wh-3',
      dest_warehouse_id: 'wh-4',
      product_id: 'prod-5',
      quantity: 25,
      status: 'PENDING',
      initiated_by: 'Kevin Park',
      dispatched_at: null,
      received_at: null,
      tracking_notes: 'Transfer initiated awaiting warehouse dock space clearance'
    }
  ];

  for (const t of transfers) {
    run(
      `INSERT OR REPLACE INTO stock_transfers (id, transfer_number, source_warehouse_id, dest_warehouse_id, product_id, quantity, status, initiated_by, dispatched_at, received_at, tracking_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [t.id, t.transfer_number, t.source_warehouse_id, t.dest_warehouse_id, t.product_id, t.quantity, t.status, t.initiated_by, t.dispatched_at, t.received_at, t.tracking_notes]
    );
  }

  // 10. Stock Adjustments (Cycle counts & Audits)
  const adjustments = [
    {
      id: 'adj-1',
      product_id: 'prod-2',
      warehouse_id: 'wh-1',
      adjustment_type: 'CYCLE_COUNT',
      quantity_delta: 2,
      reason: 'Physical count variance detected in Aisle 01-B: +2 units unrecorded from vendor sample',
      performed_by: 'Sarah Jenkins'
    },
    {
      id: 'adj-2',
      product_id: 'prod-6',
      warehouse_id: 'wh-4',
      adjustment_type: 'DAMAGE',
      quantity_delta: -1,
      reason: 'Forklift transit damage to carton frame during pallet repositioning',
      performed_by: 'Tanya Brooks'
    }
  ];

  for (const a of adjustments) {
    run(
      `INSERT OR REPLACE INTO stock_adjustments (id, product_id, warehouse_id, adjustment_type, quantity_delta, reason, performed_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.product_id, a.warehouse_id, a.adjustment_type, a.quantity_delta, a.reason, a.performed_by]
    );
  }

  // 11. Agile Capstone: 8 Epics (Agile Capstone Case Study Requirement)
  const epics = [
    {
      id: 'EPIC-1',
      title: 'Epic 1: User Authentication & Role-Based Access Control (RBAC)',
      description: 'Implement multi-role authorization (Admin, Warehouse Manager, Inventory Clerk, Purchasing Agent, Sales Rep) with secure JWT sessions.',
      business_value: 'Prevents unauthorized inventory adjustments, safeguards proprietary cost data, and enforces compliance separation of duties.',
      priority: 'CRITICAL',
      target_sprints: 'Sprints 1 - 2',
      progress_percent: 100
    },
    {
      id: 'EPIC-2',
      title: 'Epic 2: Product Catalog & SKU Lifecycle Management',
      description: 'Centralized product repository supporting categories, SKU generation, barcode tagging, unit costs, pricing margins, and imagery.',
      business_value: 'Provides single source of truth for retail merchandise across all sales channels and distribution centers.',
      priority: 'HIGH',
      target_sprints: 'Sprints 2 - 4',
      progress_percent: 100
    },
    {
      id: 'EPIC-3',
      title: 'Epic 3: Multi-Warehouse Inventory & Bin Location Tracking',
      description: 'Real-time stock balance tracking across regional hubs, aisle/bin localization, reserved stock allocation, and reorder point threshold triggers.',
      business_value: 'Eliminates phantom stockouts, reduces warehouse retrieval time by 40%, and enables predictive reordering.',
      priority: 'CRITICAL',
      target_sprints: 'Sprints 4 - 6',
      progress_percent: 100
    },
    {
      id: 'EPIC-4',
      title: 'Epic 4: Inter-Warehouse Stock Transfers & Physical Auditing',
      description: 'Automated transfer request, dispatch, and receipt pipeline with dual confirmation and cycle count reconciliation auditing.',
      business_value: 'Optimizes regional stock rebalancing without external procurement, minimizing logistics lag and write-offs.',
      priority: 'HIGH',
      target_sprints: 'Sprints 7 - 8',
      progress_percent: 100
    },
    {
      id: 'EPIC-5',
      title: 'Epic 5: Supplier Management & Purchase Order Procurement',
      description: 'Supplier directory, vendor scorecard metrics, lead time tracking, automated PO generation, and goods receipt note (GRN) posting.',
      business_value: 'Streamlines vendor negotiations, automates inbound receiving, and auto-increments stock with zero manual data entry.',
      priority: 'HIGH',
      target_sprints: 'Sprints 9 - 10',
      progress_percent: 100
    },
    {
      id: 'EPIC-6',
      title: 'Epic 6: Omnichannel Sales Order Fulfillment & Pick-Pack-Ship',
      description: 'Sales order lifecycle workflow (Pending -> Picked -> Packed -> Shipped -> Delivered) with automated inventory reservation and packing slips.',
      business_value: 'Guarantees 99.8% on-time order dispatch, prevents double-selling of reserved inventory, and provides customer tracking transparency.',
      priority: 'CRITICAL',
      target_sprints: 'Sprints 11 - 12',
      progress_percent: 100
    },
    {
      id: 'EPIC-7',
      title: 'Epic 7: Real-Time Analytics, Stock Valuation & Executive KPIs',
      description: 'Interactive dashboard with inventory turnover velocity, stock valuation, critical reorder alerts, and warehouse capacity utilization.',
      business_value: 'Empowers retail executive leadership with actionable insights on dead inventory, gross margin return on investment (GMROI).',
      priority: 'HIGH',
      target_sprints: 'Sprints 13 - 14',
      progress_percent: 100
    },
    {
      id: 'EPIC-8',
      title: 'Epic 8: CI/CD Pipeline, Dockerization & Cloud Production Deployment',
      description: 'Full containerization with multi-stage Dockerfiles, Docker Compose orchestrations, Jenkins declarative CI/CD pipeline, and Kubernetes manifests.',
      business_value: 'Ensures zero-downtime rolling upgrades, automated testing gates, and scalable cloud deployment ready for peak holiday surges.',
      priority: 'HIGH',
      target_sprints: 'Sprints 14 - 15',
      progress_percent: 100
    }
  ];

  for (const e of epics) {
    run(
      `INSERT OR REPLACE INTO agile_epics (id, title, description, business_value, priority, target_sprints, progress_percent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [e.id, e.title, e.description, e.business_value, e.priority, e.target_sprints, e.progress_percent]
    );
  }

  // 12. Agile Sprints: 15 Sprints (Agile Capstone Requirement)
  const sprints = [
    { id: 'SPRINT-01', sprint_number: 1, name: 'Sprint 1: Architecture Inception & RBAC Foundation', epic_id: 'EPIC-1', goal: 'Establish SQLite/Postgres DB schema, Express REST skeleton, and JWT auth with role permissions.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 34, start_date: '2026-05-01', end_date: '2026-05-14' },
    { id: 'SPRINT-02', sprint_number: 2, name: 'Sprint 2: User Profiles & Product Catalog Schema', epic_id: 'EPIC-2', goal: 'Deliver categories management, product master CRUD, and SKU format validation.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 38, start_date: '2026-05-15', end_date: '2026-05-28' },
    { id: 'SPRINT-03', sprint_number: 3, name: 'Sprint 3: Product Search, Filtering & Barcoding', epic_id: 'EPIC-2', goal: 'Implement full-text search, barcode visualization, and category tagging UI.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 40, start_date: '2026-05-29', end_date: '2026-06-11' },
    { id: 'SPRINT-04', sprint_number: 4, name: 'Sprint 4: Multi-Warehouse Location Registry', epic_id: 'EPIC-3', goal: 'Build warehouse site profiles, capacity metrics, and manager assignment routes.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 36, start_date: '2026-06-12', end_date: '2026-06-25' },
    { id: 'SPRINT-05', sprint_number: 5, name: 'Sprint 5: Inventory Balances & Bin Allocation', epic_id: 'EPIC-3', goal: 'Implement stock level matrix across warehouses with aisle/bin physical coordinates.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 42, start_date: '2026-06-26', end_date: '2026-07-09' },
    { id: 'SPRINT-06', sprint_number: 6, name: 'Sprint 6: Low Stock Triggers & Reorder Points', epic_id: 'EPIC-3', goal: 'Develop real-time warning indicators when quantities breach minimum safety stock levels.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 35, start_date: '2026-07-10', end_date: '2026-07-23' },
    { id: 'SPRINT-07', sprint_number: 7, name: 'Sprint 7: Inter-Warehouse Stock Transfer Workflow', epic_id: 'EPIC-4', goal: 'Create transfer order creation, atomic in-transit balance lock, and dispatch workflow.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 44, start_date: '2026-07-24', end_date: '2026-08-06' },
    { id: 'SPRINT-08', sprint_number: 8, name: 'Sprint 8: Receiving Transfers & Cycle Count Audit', epic_id: 'EPIC-4', goal: 'Implement destination receipt confirmation and stock adjustment audit log with reason codes.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 39, start_date: '2026-08-07', end_date: '2026-08-20' },
    { id: 'SPRINT-09', sprint_number: 9, name: 'Sprint 9: Supplier Directory & Vendor Scorecards', epic_id: 'EPIC-5', goal: 'Deliver supplier profiles, contact cards, lead time metrics, and performance ratings.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 37, start_date: '2026-08-21', end_date: '2026-09-03' },
    { id: 'SPRINT-10', sprint_number: 10, name: 'Sprint 10: Purchase Order Creation & Goods Receipt (GRN)', epic_id: 'EPIC-5', goal: 'Build multi-item purchase order generation and automated warehouse stock incrementing upon delivery.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 45, start_date: '2026-09-04', end_date: '2026-09-17' },
    { id: 'SPRINT-11', sprint_number: 11, name: 'Sprint 11: Sales Order Ingestion & Stock Reservation', epic_id: 'EPIC-6', goal: 'Build sales order pipeline with immediate soft-reservation of warehouse inventory items.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 41, start_date: '2026-09-18', end_date: '2026-10-01' },
    { id: 'SPRINT-12', sprint_number: 12, name: 'Sprint 12: Pick-Pack-Ship Workflow & Packing Slips', epic_id: 'EPIC-6', goal: 'Deliver interactive fulfillment stepper, tracking carrier integration, and invoice generation.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 43, start_date: '2026-10-02', end_date: '2026-10-15' },
    { id: 'SPRINT-13', sprint_number: 13, name: 'Sprint 13: Executive Analytics Dashboard & Recharts', epic_id: 'EPIC-7', goal: 'Construct interactive visual analytics: valuation by category, stock balance by warehouse, monthly trends.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 40, start_date: '2026-10-16', end_date: '2026-10-29' },
    { id: 'SPRINT-14', sprint_number: 14, name: 'Sprint 14: Docker Containerization & Compose Orchestration', epic_id: 'EPIC-8', goal: 'Containerize backend and frontend, create docker-compose with healthchecks and postgres support.', duration: '2 Weeks', status: 'COMPLETED', velocity_points: 38, start_date: '2026-10-30', end_date: '2026-11-12' },
    { id: 'SPRINT-15', sprint_number: 15, name: 'Sprint 15: Jenkins CI/CD Pipeline & Kubernetes Production Manifests', epic_id: 'EPIC-8', goal: 'Write Jenkinsfile pipeline with automated test stages and Kubernetes YAML deployments & ingress.', duration: '2 Weeks', status: 'ACTIVE', velocity_points: 42, start_date: '2026-11-13', end_date: '2026-11-26' }
  ];

  for (const sp of sprints) {
    run(
      `INSERT OR REPLACE INTO agile_sprints (id, sprint_number, name, epic_id, goal, duration, status, velocity_points, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [sp.id, sp.sprint_number, sp.name, sp.epic_id, sp.goal, sp.duration, sp.status, sp.velocity_points, sp.start_date, sp.end_date]
    );
  }

  // 13. Agile User Stories (Mapped to Sprints with Acceptance Criteria & Story Points)
  const userStories = [
    {
      id: 'US-101',
      epic_id: 'EPIC-1',
      sprint_id: 'SPRINT-01',
      title: 'Secure Role-Based Authentication with JWT',
      user_role: 'System Administrator',
      capability: 'log in with credentials and receive a cryptographically signed JWT token with assigned role',
      benefit: 'only authorized personnel can access sensitive inventory cost prices and audit logs',
      acceptance_criteria: 'Given valid user credentials, return JWT with role claims; restrict endpoints by role.',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'Backend Dev'
    },
    {
      id: 'US-102',
      epic_id: 'EPIC-2',
      sprint_id: 'SPRINT-02',
      title: 'Product Master Data Management (CRUD)',
      user_role: 'Inventory Manager',
      capability: 'create, update, view, and retire products with unique SKU, barcode, unit cost, and price',
      benefit: 'the retail network maintains an accurate and unified master product catalog',
      acceptance_criteria: 'Prevent duplicate SKU submission; validate non-negative numbers for pricing.',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'Full Stack Dev'
    },
    {
      id: 'US-103',
      epic_id: 'EPIC-2',
      sprint_id: 'SPRINT-03',
      title: 'Real-Time Product Catalog Search & Category Filters',
      user_role: 'Retail Operations Specialist',
      capability: 'instantaneously search products by SKU, name, or barcode and filter by category or stock status',
      benefit: 'quickly locate items during customer queries or warehouse stock audits',
      acceptance_criteria: 'Debounced search queries return within <100ms; multi-category filtering matches all selected.',
      story_points: 3,
      status: 'DONE',
      assignee_role: 'Frontend Dev'
    },
    {
      id: 'US-104',
      epic_id: 'EPIC-3',
      sprint_id: 'SPRINT-04',
      title: 'Multi-Warehouse Geographic Site Management',
      user_role: 'Logistics Director',
      capability: 'define multiple regional warehouses with physical addresses, storage capacity, and site managers',
      benefit: 'track distributed stock levels across national distribution hubs accurately',
      acceptance_criteria: 'Support multiple active warehouses; calculate aggregate capacity utilization percentage.',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'Backend Dev'
    },
    {
      id: 'US-105',
      epic_id: 'EPIC-3',
      sprint_id: 'SPRINT-05',
      title: 'Aisle & Bin Specific Location Mapping',
      user_role: 'Warehouse Picker',
      capability: 'see exact bin coordinate (e.g. AISLE-01-A-12) for every product in a warehouse',
      benefit: 'minimize pick travel time and prevent misplaced inventory',
      acceptance_criteria: 'Bin locations visible on stock grid; editable by warehouse manager role.',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'Frontend Dev'
    },
    {
      id: 'US-106',
      epic_id: 'EPIC-3',
      sprint_id: 'SPRINT-06',
      title: 'Automated Low Stock & Stockout Warning Indicators',
      user_role: 'Procurement Specialist',
      capability: 'receive automated visual alerts and list flags when stock dips below product reorder point',
      benefit: 'trigger timely purchase orders before zero-stock stockouts occur',
      acceptance_criteria: 'Highlight items in red/amber; badge indicator on dashboard header reflects count.',
      story_points: 3,
      status: 'DONE',
      assignee_role: 'Frontend Dev'
    },
    {
      id: 'US-107',
      epic_id: 'EPIC-4',
      sprint_id: 'SPRINT-07',
      title: 'Inter-Warehouse Stock Transfer Creation & In-Transit Lock',
      user_role: 'Warehouse Manager',
      capability: 'initiate transfer of specific quantity from Origin to Destination warehouse',
      benefit: 'rebalance excess inventory across stores without ordering from external suppliers',
      acceptance_criteria: 'Validate sufficient available stock; atomically deduct available quantity upon dispatch.',
      story_points: 8,
      status: 'DONE',
      assignee_role: 'Lead Developer'
    },
    {
      id: 'US-108',
      epic_id: 'EPIC-4',
      sprint_id: 'SPRINT-08',
      title: 'Destination Transfer Receipt & Cycle Count Reconciliation',
      user_role: 'Receiving Dock Supervisor',
      capability: 'mark incoming stock transfers as received with inspection notes and record physical variances',
      benefit: 'ensure inventory ledger matches actual physical counts on shelves',
      acceptance_criteria: 'Auto-increment destination stock; log adjustment reason codes (DAMAGE, CYCLE_COUNT).',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'Full Stack Dev'
    },
    {
      id: 'US-109',
      epic_id: 'EPIC-5',
      sprint_id: 'SPRINT-09',
      title: 'Supplier Profile Directory & Performance Scorecard',
      user_role: 'Purchasing Manager',
      capability: 'maintain supplier database with lead times, rating scores, payment terms, and direct contacts',
      benefit: 'route purchase orders to reliable and cost-effective vendor partners',
      acceptance_criteria: 'Star ratings 1-5; display active purchase orders per vendor.',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'Frontend Dev'
    },
    {
      id: 'US-110',
      epic_id: 'EPIC-5',
      sprint_id: 'SPRINT-10',
      title: 'Purchase Order Workflow & Automated Goods Receipt (GRN)',
      user_role: 'Procurement Lead',
      capability: 'generate multi-line item purchase orders and post Goods Receipt Note to automatically restock warehouse',
      benefit: 'eliminate manual re-entry of inbound stock shipments',
      acceptance_criteria: 'One-click Receive action increases warehouse balance and marks PO as RECEIVED.',
      story_points: 8,
      status: 'DONE',
      assignee_role: 'Full Stack Dev'
    },
    {
      id: 'US-111',
      epic_id: 'EPIC-6',
      sprint_id: 'SPRINT-11',
      title: 'Sales Order Ingestion & Real-Time Stock Reservation',
      user_role: 'Sales Representative',
      capability: 'submit customer sales orders which immediately soft-reserve stock from chosen warehouse',
      benefit: 'prevent overselling during flash sales and peak ordering periods',
      acceptance_criteria: 'Check real-time stock; increment reserved_quantity on line item submission.',
      story_points: 8,
      status: 'DONE',
      assignee_role: 'Backend Dev'
    },
    {
      id: 'US-112',
      epic_id: 'EPIC-6',
      sprint_id: 'SPRINT-12',
      title: 'Pick, Pack, Ship Fulfillment Stepper & Printable Slips',
      user_role: 'Fulfillment Clerk',
      capability: 'progress sales orders through Picked, Packed, and Shipped states and generate printable invoices',
      benefit: 'standardize warehouse dispatch operations and provide carrier tracking codes',
      acceptance_criteria: 'Deduct physical stock and clear reserved stock upon Shipped status change.',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'Frontend Dev'
    },
    {
      id: 'US-113',
      epic_id: 'EPIC-7',
      sprint_id: 'SPRINT-13',
      title: 'Executive KPI Dashboard & Visual Inventory Charts',
      user_role: 'Chief Operating Officer',
      capability: 'view aggregate inventory valuation, stock distribution charts, and low stock warnings at a glance',
      benefit: 'make informed supply chain decisions supported by real-time data visualizations',
      acceptance_criteria: 'Recharts visualizations for warehouse breakdown and category valuation; fast response time.',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'Frontend Dev'
    },
    {
      id: 'US-114',
      epic_id: 'EPIC-8',
      sprint_id: 'SPRINT-14',
      title: 'Production Docker Containerization & Compose Setup',
      user_role: 'DevOps Engineer',
      capability: 'build multi-stage Dockerfiles and docker-compose.yml orchestrating frontend, backend, and database',
      benefit: 'reproduce consistent runtime environments across local development, staging, and production',
      acceptance_criteria: 'docker compose up starts full stack cleanly with environment variables.',
      story_points: 5,
      status: 'DONE',
      assignee_role: 'DevOps Specialist'
    },
    {
      id: 'US-115',
      epic_id: 'EPIC-8',
      sprint_id: 'SPRINT-15',
      title: 'Jenkins Declarative CI/CD Pipeline & Kubernetes Manifests',
      user_role: 'DevOps Architect',
      capability: 'execute automated build, test, and container packaging stages via Jenkinsfile and deploy to K8s cluster',
      benefit: 'achieve continuous deployment quality gates with zero manual human error',
      acceptance_criteria: 'Lint, test, build, docker image creation stages defined; K8s YAML for Deployment, Service, Ingress.',
      story_points: 8,
      status: 'IN_PROGRESS',
      assignee_role: 'DevOps Specialist'
    }
  ];

  for (const us of userStories) {
    run(
      `INSERT OR REPLACE INTO agile_user_stories (id, epic_id, sprint_id, title, user_role, capability, benefit, acceptance_criteria, story_points, status, assignee_role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [us.id, us.epic_id, us.sprint_id, us.title, us.user_role, us.capability, us.benefit, us.acceptance_criteria, us.story_points, us.status, us.assignee_role]
    );
  }

  // 14. Initial Audit Logs
  run(`INSERT OR REPLACE INTO audit_logs (id, action, entity, entity_id, details, user_name) VALUES (?, ?, ?, ?, ?, ?)`,
    ['log-1', 'INITIALIZE', 'SYSTEM', 'SYS-001', 'System installed with 4 warehouses, 12 catalog products, and 8 Agile Epics', 'admin']
  );
  run(`INSERT OR REPLACE INTO audit_logs (id, action, entity, entity_id, details, user_name) VALUES (?, ?, ?, ?, ?, ?)`,
    ['log-2', 'PURCHASE_RECEIVE', 'PO', 'PO-2026-101', 'Received 50 units Ultrabook Pro 15.6 into Chicago Hub', 'David Chen']
  );

  console.log('[SEED] Database populated with full retail inventory and 8 Epics / 15 Sprints capstone data.');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
