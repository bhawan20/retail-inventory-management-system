const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const screenshotsDir = path.resolve('C:/Users/Asus/.gemini/antigravity/brain/b0fd9f58-e6c4-4230-8764-e9b2137279d2/screenshots');
const outputHtmlPath = path.resolve(__dirname, 'simple_project_report.html');
const outputPdfPath = path.resolve(__dirname, 'Retail_Inventory_Project_Code_And_Screenshots_Simple.pdf');

// All Code Files of the Project
const filesToInclude = [
  // --- BACKEND CODE ---
  { section: 'Backend', title: '1. Backend Server Entrypoint (server.js)', path: 'backend/src/server.js' },
  { section: 'Backend', title: '2. Database Connection & Config (config/db.js)', path: 'backend/src/config/db.js' },
  { section: 'Backend', title: '3. Database Schema - 16 Tables (db/schema.js)', path: 'backend/src/db/schema.js' },
  { section: 'Backend', title: '4. Database Seed Data (db/seed.js)', path: 'backend/src/db/seed.js' },
  { section: 'Backend', title: '5. PostgreSQL Migration Schema (db/postgres_schema.sql)', path: 'backend/src/db/postgres_schema.sql' },
  { section: 'Backend', title: '6. Auth & RBAC Middleware (middleware/auth.js)', path: 'backend/src/middleware/auth.js' },
  { section: 'Backend', title: '7. Auth Routes Controller (routes/auth.routes.js)', path: 'backend/src/routes/auth.routes.js' },
  { section: 'Backend', title: '8. Products Master Routes (routes/products.routes.js)', path: 'backend/src/routes/products.routes.js' },
  { section: 'Backend', title: '9. Categories Routes (routes/categories.routes.js)', path: 'backend/src/routes/categories.routes.js' },
  { section: 'Backend', title: '10. Warehouses Routes (routes/warehouses.routes.js)', path: 'backend/src/routes/warehouses.routes.js' },
  { section: 'Backend', title: '11. Inventory & Stock Adjustments (routes/inventory.routes.js)', path: 'backend/src/routes/inventory.routes.js' },
  { section: 'Backend', title: '12. Inter-Warehouse Transfers (routes/transfers.routes.js)', path: 'backend/src/routes/transfers.routes.js' },
  { section: 'Backend', title: '13. Suppliers Management (routes/suppliers.routes.js)', path: 'backend/src/routes/suppliers.routes.js' },
  { section: 'Backend', title: '14. Purchase Orders & GRN (routes/purchaseOrders.routes.js)', path: 'backend/src/routes/purchaseOrders.routes.js' },
  { section: 'Backend', title: '15. Sales Orders & Fulfillment (routes/salesOrders.routes.js)', path: 'backend/src/routes/salesOrders.routes.js' },
  { section: 'Backend', title: '16. Analytics & KPIs Routes (routes/analytics.routes.js)', path: 'backend/src/routes/analytics.routes.js' },
  { section: 'Backend', title: '17. Agile Capstone 8 Epics / 15 Sprints (routes/agile.routes.js)', path: 'backend/src/routes/agile.routes.js' },
  { section: 'Backend', title: '18. Backend package.json', path: 'backend/package.json' },

  // --- FRONTEND CODE ---
  { section: 'Frontend', title: '19. Main React App Layout (src/App.jsx)', path: 'frontend/src/App.jsx' },
  { section: 'Frontend', title: '20. Frontend API Client (src/services/api.js)', path: 'frontend/src/services/api.js' },
  { section: 'Frontend', title: '21. Navigation Bar with Role Switcher (src/components/Navbar.jsx)', path: 'frontend/src/components/Navbar.jsx' },
  { section: 'Frontend', title: '22. Navigation Sidebar with Badges (src/components/Sidebar.jsx)', path: 'frontend/src/components/Sidebar.jsx' },
  { section: 'Frontend', title: '23. Executive Dashboard View (src/views/DashboardView.jsx)', path: 'frontend/src/views/DashboardView.jsx' },
  { section: 'Frontend', title: '24. Product Catalog View (src/views/ProductsView.jsx)', path: 'frontend/src/views/ProductsView.jsx' },
  { section: 'Frontend', title: '25. Multi-Warehouse Matrix View (src/views/WarehousesView.jsx)', path: 'frontend/src/views/WarehousesView.jsx' },
  { section: 'Frontend', title: '26. Stock Transfers View (src/views/TransfersView.jsx)', path: 'frontend/src/views/TransfersView.jsx' },
  { section: 'Frontend', title: '27. Suppliers Directory View (src/views/SuppliersView.jsx)', path: 'frontend/src/views/SuppliersView.jsx' },
  { section: 'Frontend', title: '28. Purchase Orders View (src/views/PurchaseOrdersView.jsx)', path: 'frontend/src/views/PurchaseOrdersView.jsx' },
  { section: 'Frontend', title: '29. Order Fulfillment Stepper View (src/views/SalesOrdersView.jsx)', path: 'frontend/src/views/SalesOrdersView.jsx' },
  { section: 'Frontend', title: '30. Agile Scrum Kanban Board View (src/views/AgileCapstoneView.jsx)', path: 'frontend/src/views/AgileCapstoneView.jsx' },
  { section: 'Frontend', title: '31. System Architecture View (src/views/ArchitectureView.jsx)', path: 'frontend/src/views/ArchitectureView.jsx' },
  { section: 'Frontend', title: '32. Vite Config (vite.config.js)', path: 'frontend/vite.config.js' },
  { section: 'Frontend', title: '33. Frontend package.json', path: 'frontend/package.json' },

  // --- DEVOPS & SCRIPTS ---
  { section: 'DevOps', title: '34. Docker Compose Orchestration (devops/docker-compose.yml)', path: 'devops/docker-compose.yml' },
  { section: 'DevOps', title: '35. Backend Dockerfile (devops/Dockerfile.backend)', path: 'devops/Dockerfile.backend' },
  { section: 'DevOps', title: '36. Frontend Dockerfile (devops/Dockerfile.frontend)', path: 'devops/Dockerfile.frontend' },
  { section: 'DevOps', title: '37. Jenkins CI/CD Pipeline (devops/Jenkinsfile)', path: 'devops/Jenkinsfile' },
  { section: 'DevOps', title: '38. Kubernetes ConfigMap (devops/k8s/01-configmap.yaml)', path: 'devops/k8s/01-configmap.yaml' },
  { section: 'DevOps', title: '39. Kubernetes Backend Deployment (devops/k8s/03-backend.yaml)', path: 'devops/k8s/03-backend.yaml' },
  { section: 'DevOps', title: '40. Kubernetes Frontend Deployment (devops/k8s/04-frontend.yaml)', path: 'devops/k8s/04-frontend.yaml' },
  { section: 'DevOps', title: '41. 1-Click Windows Run Script (start-dev.bat)', path: 'start-dev.bat' }
];

// Screenshots info
const screenshots = [
  { file: 'dashboard.png', title: '1. Executive KPI Dashboard & Real-Time Analytics', desc: 'Stock valuation, total units, warehouse storage bars, low-stock alerts, and activity feed.' },
  { file: 'products.png', title: '2. Centralized Product Catalog & SKU Master', desc: 'SKU master repository with EAN-13 barcodes, pricing margins, and safety reorder limits.' },
  { file: 'warehouses.png', title: '3. Multi-Warehouse Logistics & Cross-Site Stock Matrix', desc: '4 Regional hubs (Chicago, New Jersey, California, Texas) with capacity meters and aisle/bin mapping.' },
  { file: 'transfers.png', title: '4. Inter-Warehouse Stock Transfers & Physical Audits', desc: 'Atomic transfer order pipeline (Pending -> In Transit -> Received) and physical variance audits.' },
  { file: 'suppliers.png', title: '5. Supplier Directory & Vendor Scorecards', desc: 'Vendor management with lead-time tracking, quality ratings, and contract payment terms.' },
  { file: 'purchase-orders.png', title: '6. Procurement Purchase Orders & Goods Receipt (GRN)', desc: 'Multi-line PO generation and 1-Click Goods Receipt Note (GRN) that auto-restocks target warehouses.' },
  { file: 'sales-orders.png', title: '7. Omnichannel Sales Order Fulfillment (Pick-Pack-Ship)', desc: 'Order fulfillment stepper with real-time stock reservation and shipping carrier tracking codes.' },
  { file: 'agile.png', title: '8. Agile Scrum Capstone Suite (8 Epics & 15 Sprints)', desc: 'Interactive Jira-style Scrum Kanban board with user stories, acceptance criteria, and burndown chart.' },
  { file: 'architecture.png', title: '9. Four-Tier Architecture, Database ERD & REST API Specs', desc: 'Full-stack technical specifications, 16 relational database entities, and complete RESTful API documentation.' }
];

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function imageToBase64(imgPath) {
  try {
    const data = fs.readFileSync(imgPath);
    return `data:image/png;base64,${data.toString('base64')}`;
  } catch (err) {
    return '';
  }
}

console.log('[SIMPLE PDF] Compiling HTML document...');

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Retail Inventory Management System - Complete Source Code & Project Screenshots</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 12mm 12mm 12mm;
    }
    body {
      font-family: Arial, sans-serif;
      color: #111827;
      line-height: 1.4;
      font-size: 10pt;
      margin: 0;
      padding: 0;
    }
    .cover-box {
      border: 2px solid #2563eb;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      margin-bottom: 25px;
      background: #f8fafc;
    }
    .cover-box h1 {
      font-size: 24pt;
      color: #1e3a8a;
      margin: 0 0 10px 0;
    }
    .cover-box p {
      font-size: 11pt;
      color: #4b5563;
      margin: 5px 0;
    }
    .meta-grid {
      display: table;
      width: 100%;
      margin-top: 15px;
      border-top: 1px solid #cbd5e1;
      padding-top: 15px;
      text-align: left;
      font-size: 9.5pt;
    }
    .meta-row {
      display: table-row;
    }
    .meta-cell-label {
      display: table-cell;
      font-weight: bold;
      color: #374151;
      padding: 4px 8px;
      width: 30%;
    }
    .meta-cell-val {
      display: table-cell;
      color: #1f2937;
      padding: 4px 8px;
    }
    .page-break {
      page-break-after: always;
    }
    h2.part-header {
      font-size: 16pt;
      color: #ffffff;
      background: #1e40af;
      padding: 8px 14px;
      border-radius: 6px;
      margin: 25px 0 15px 0;
    }
    .ss-block {
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 20px;
      background: #ffffff;
      page-break-inside: avoid;
    }
    .ss-block h3 {
      font-size: 11pt;
      color: #1f2937;
      margin: 0 0 3px 0;
    }
    .ss-block p {
      font-size: 8.5pt;
      color: #4b5563;
      margin: 0 0 8px 0;
    }
    .ss-block img {
      width: 100%;
      height: auto;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      display: block;
    }
    .code-block {
      margin-bottom: 20px;
      page-break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }
    .code-title {
      background: #0f172a;
      color: #f8fafc;
      padding: 6px 10px;
      font-size: 9pt;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
    }
    .code-title .file-name {
      color: #38bdf8;
      font-family: monospace;
      font-weight: normal;
    }
    pre {
      background: #f8fafc;
      color: #0f172a;
      padding: 8px 10px;
      margin: 0;
      font-family: "Courier New", Courier, monospace;
      font-size: 7.5pt;
      line-height: 1.3;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>

  <!-- COVER BOX -->
  <div class="cover-box">
    <div style="font-size: 10pt; font-weight: bold; color: #2563eb; letter-spacing: 1px; margin-bottom: 6px;">
      CAPSTONE CASE STUDY (P_022) • FULL STACK DEVELOPMENT
    </div>
    <h1>Retail Inventory Management System</h1>
    <p style="font-weight: bold; font-size: 13pt; color: #1e293b;">
      Complete Source Code Documentation & Working Screenshots
    </p>
    <p>
      Multi-Warehouse Retail Inventory, Supplier Procurement, Order Fulfillment, and Agile Scrum Management.
    </p>

    <div class="meta-grid">
      <div class="meta-row">
        <div class="meta-cell-label">Technology Stack:</div>
        <div class="meta-cell-val">React 18 (Vite, Tailwind CSS), Node.js (Express), SQLite & PostgreSQL, Docker</div>
      </div>
      <div class="meta-row">
        <div class="meta-cell-label">Agile Methodology:</div>
        <div class="meta-cell-val">8 Epics, 15 Sprints, Jira-Style User Stories, Velocity Burndown</div>
      </div>
      <div class="meta-row">
        <div class="meta-cell-label">GitHub Repository:</div>
        <div class="meta-cell-val">https://github.com/bhawan20/retail-inventory-management-system</div>
      </div>
      <div class="meta-row">
        <div class="meta-cell-label">Project Status:</div>
        <div class="meta-cell-val">100% Complete & Fully Working</div>
      </div>
    </div>
  </div>

  <!-- PART 1: LIVE WORKING SCREENSHOTS -->
  <div class="page-break"></div>
  <h2 class="part-header">PART 1: WORKING PROJECT SCREENSHOTS (LIVE RUNNING)</h2>
  <p style="font-size: 9pt; color: #4b5563; margin-bottom: 15px;">
    Below are the actual high-resolution screenshots captured from the live application running at <code>http://localhost:3000</code> with the backend API at <code>http://localhost:5000</code>.
  </p>
`;

// Insert Screenshots
for (const s of screenshots) {
  const imgPath = path.join(screenshotsDir, s.file);
  const base64 = imageToBase64(imgPath);
  html += `
  <div class="ss-block">
    <h3>${s.title}</h3>
    <p>${s.desc}</p>
    <img src="${base64}" alt="${s.title}" />
  </div>
  `;
}

// PART 2: SOURCE CODE
html += `
  <div class="page-break"></div>
  <h2 class="part-header">PART 2: COMPLETE SOURCE CODE OF THE PROJECT</h2>
  <p style="font-size: 9pt; color: #4b5563; margin-bottom: 15px;">
    Below is the complete, unmodified source code for all backend controllers, database schemas, frontend views, and DevOps configurations.
  </p>
`;

for (const f of filesToInclude) {
  const fullPath = path.join(rootDir, f.path);
  let content = '';
  try {
    content = fs.readFileSync(fullPath, 'utf8');
  } catch (err) {
    content = `// File could not be read: ${err.message}`;
  }

  html += `
  <div class="code-block">
    <div class="code-title">
      <span>${f.title}</span>
      <span class="file-name">${f.path}</span>
    </div>
    <pre><code>${escapeHtml(content)}</code></pre>
  </div>
  `;
}

html += `
</body>
</html>
`;

fs.writeFileSync(outputHtmlPath, html, 'utf8');
console.log(`[SIMPLE PDF] HTML generated (${(fs.statSync(outputHtmlPath).size / 1024).toFixed(1)} KB)`);

console.log('[SIMPLE PDF] Converting HTML to simple clean PDF...');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${outputPdfPath}" --print-to-pdf-no-header "${outputHtmlPath}"`, { stdio: 'inherit' });

console.log(`[SIMPLE PDF] Clean PDF created at: ${outputPdfPath}`);
