const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const screenshotsDir = path.resolve('C:/Users/Asus/.gemini/antigravity/brain/b0fd9f58-e6c4-4230-8764-e9b2137279d2/screenshots');
const outputHtmlPath = path.resolve(__dirname, 'capstone_submission_paired.html');
const outputPdfPath = path.resolve(__dirname, 'Retail_Inventory_Management_System_Final_Submission.pdf');

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

function readCode(relPath) {
  try {
    return fs.readFileSync(path.join(rootDir, relPath), 'utf8');
  } catch (err) {
    return `// Error reading file: ${err.message}`;
  }
}

// 9 Modules Paired: Output Screenshot + Full Source Code Files
const modules = [
  {
    moduleNumber: 1,
    title: 'Module 1: Executive KPI Dashboard & Real-Time Analytics',
    description: 'Displays multi-warehouse inventory valuation, total units, available vs reserved balances, active safety reorder alerts, and dynamic capacity meters.',
    screenshot: 'dashboard.png',
    screenshotCaption: 'Live Working Output: Executive KPI Analytics Dashboard with Recharts visualization and immutable supply chain audit feed.',
    codes: [
      { label: 'Frontend View: DashboardView.jsx', path: 'frontend/src/views/DashboardView.jsx' },
      { label: 'Backend API: analytics.routes.js', path: 'backend/src/routes/analytics.routes.js' }
    ]
  },
  {
    moduleNumber: 2,
    title: 'Module 2: Centralized Product Catalog & SKU Master Data',
    description: 'Master catalog repository supporting unique SKU validation, EAN-13 barcodes, unit selling price, cost price, profit margins, safety reorder thresholds, and search filters.',
    screenshot: 'products.png',
    screenshotCaption: 'Live Working Output: Product Catalog table with live search filters, pricing margin calculators, and warehouse stock breakdown.',
    codes: [
      { label: 'Frontend View: ProductsView.jsx', path: 'frontend/src/views/ProductsView.jsx' },
      { label: 'Backend API: products.routes.js', path: 'backend/src/routes/products.routes.js' },
      { label: 'Backend API: categories.routes.js', path: 'backend/src/routes/categories.routes.js' }
    ]
  },
  {
    moduleNumber: 3,
    title: 'Module 3: Multi-Warehouse Logistics & Cross-Site Stock Matrix',
    description: 'Manages 4 regional fulfillment centers (Chicago, New Jersey, California, Texas) with storage capacity utilization progress bars and physical aisle/bin coordinate mapping.',
    screenshot: 'warehouses.png',
    screenshotCaption: 'Live Working Output: Multi-Warehouse Distribution Centers with storage capacity meters and cross-warehouse stock matrix.',
    codes: [
      { label: 'Frontend View: WarehousesView.jsx', path: 'frontend/src/views/WarehousesView.jsx' },
      { label: 'Backend API: warehouses.routes.js', path: 'backend/src/routes/warehouses.routes.js' }
    ]
  },
  {
    moduleNumber: 4,
    title: 'Module 4: Inter-Warehouse Stock Transfers & Physical Count Audits',
    description: 'Atomic inventory transfer workflow (Pending -> In Transit -> Received) with dispatch balance locking, and cycle count variance/damage write-off auditing.',
    screenshot: 'transfers.png',
    screenshotCaption: 'Live Working Output: Inter-warehouse stock transfer tracker with dispatch and receive workflow actions.',
    codes: [
      { label: 'Frontend View: TransfersView.jsx', path: 'frontend/src/views/TransfersView.jsx' },
      { label: 'Backend API: transfers.routes.js', path: 'backend/src/routes/transfers.routes.js' },
      { label: 'Backend API: inventory.routes.js', path: 'backend/src/routes/inventory.routes.js' }
    ]
  },
  {
    moduleNumber: 5,
    title: 'Module 5: Supplier Directory & Vendor Scorecards',
    description: 'Maintains supplier contact directory, delivery lead-time metrics, star quality ratings, and contractual payment terms.',
    screenshot: 'suppliers.png',
    screenshotCaption: 'Live Working Output: Supplier partner scorecards with lead-time tracking and active purchase order counts.',
    codes: [
      { label: 'Frontend View: SuppliersView.jsx', path: 'frontend/src/views/SuppliersView.jsx' },
      { label: 'Backend API: suppliers.routes.js', path: 'backend/src/routes/suppliers.routes.js' }
    ]
  },
  {
    moduleNumber: 6,
    title: 'Module 6: Procurement Purchase Orders & Goods Receipt Note (GRN)',
    description: 'Multi-line PO generation with auto-calculated commitments, expected delivery dates, and 1-Click Goods Receipt Note (GRN) that restocks target warehouse ledgers.',
    screenshot: 'purchase-orders.png',
    screenshotCaption: 'Live Working Output: Purchase order commitments table with 1-Click Goods Receipt Note (GRN) receiving action.',
    codes: [
      { label: 'Frontend View: PurchaseOrdersView.jsx', path: 'frontend/src/views/PurchaseOrdersView.jsx' },
      { label: 'Backend API: purchaseOrders.routes.js', path: 'backend/src/routes/purchaseOrders.routes.js' }
    ]
  },
  {
    moduleNumber: 7,
    title: 'Module 7: Omnichannel Sales Order Fulfillment (Pick-Pack-Ship)',
    description: 'Customer order fulfillment pipeline (Pending -> Picking -> Packed -> Shipped) with real-time stock reservation to prevent overselling and shipping carrier tracking.',
    screenshot: 'sales-orders.png',
    screenshotCaption: 'Live Working Output: Order fulfillment pipeline with status progression buttons and printable packing slip.',
    codes: [
      { label: 'Frontend View: SalesOrdersView.jsx', path: 'frontend/src/views/SalesOrdersView.jsx' },
      { label: 'Backend API: salesOrders.routes.js', path: 'backend/src/routes/salesOrders.routes.js' }
    ]
  },
  {
    moduleNumber: 8,
    title: 'Module 8: Agile Scrum Capstone Suite (8 Epics & 15 Sprints)',
    description: 'Interactive Jira-style Scrum Kanban board with user stories, acceptance criteria, story point estimates, 8 Epics breakdown, and 15 Sprints velocity roadmap.',
    screenshot: 'agile.png',
    screenshotCaption: 'Live Working Output: Interactive Scrum Kanban Board with movable story cards across To Do, In Progress, Review, and Done.',
    codes: [
      { label: 'Frontend View: AgileCapstoneView.jsx', path: 'frontend/src/views/AgileCapstoneView.jsx' },
      { label: 'Backend API: agile.routes.js', path: 'backend/src/routes/agile.routes.js' }
    ]
  },
  {
    moduleNumber: 9,
    title: 'Module 9: System Architecture, Database ERD & REST API Specs',
    description: 'Full-stack technical specifications, 4-tier layered architecture, 16 relational database entities, and complete REST API documentation table.',
    screenshot: 'architecture.png',
    screenshotCaption: 'Live Working Output: System Architecture specifications, database ERD schema, and REST endpoint tables.',
    codes: [
      { label: 'Frontend View: ArchitectureView.jsx', path: 'frontend/src/views/ArchitectureView.jsx' },
      { label: 'Backend Database Schema DDL: schema.js', path: 'backend/src/db/schema.js' },
      { label: 'Database Configuration & Connection: config/db.js', path: 'backend/src/config/db.js' },
      { label: 'Database Seed Dataset: db/seed.js', path: 'backend/src/db/seed.js' },
      { label: 'PostgreSQL Enterprise Migration: postgres_schema.sql', path: 'backend/src/db/postgres_schema.sql' }
    ]
  }
];

// Additional Infrastructure & Entrypoint Codes
const infraCodes = [
  { label: 'Backend Server Entrypoint (server.js)', path: 'backend/src/server.js' },
  { label: 'Auth & RBAC Middleware (middleware/auth.js)', path: 'backend/src/middleware/auth.js' },
  { label: 'Frontend Root Component (App.jsx)', path: 'frontend/src/App.jsx' },
  { label: 'Frontend API Service Client (api.js)', path: 'frontend/src/services/api.js' },
  { label: 'Top Navigation with Role Switcher (Navbar.jsx)', path: 'frontend/src/components/Navbar.jsx' },
  { label: 'Sidebar Navigation with Badges (Sidebar.jsx)', path: 'frontend/src/components/Sidebar.jsx' },
  { label: 'Backend package.json', path: 'backend/package.json' },
  { label: 'Frontend package.json', path: 'frontend/package.json' },
  { label: 'Vite Configuration (vite.config.js)', path: 'frontend/vite.config.js' },
  { label: 'Docker Compose Orchestration (docker-compose.yml)', path: 'devops/docker-compose.yml' },
  { label: 'Backend Dockerfile (devops/Dockerfile.backend)', path: 'devops/Dockerfile.backend' },
  { label: 'Frontend Dockerfile (devops/Dockerfile.frontend)', path: 'devops/Dockerfile.frontend' },
  { label: 'Jenkins CI/CD Declarative Pipeline (Jenkinsfile)', path: 'devops/Jenkinsfile' },
  { label: 'Kubernetes ConfigMap (devops/k8s/01-configmap.yaml)', path: 'devops/k8s/01-configmap.yaml' },
  { label: 'Kubernetes Backend Deployment (devops/k8s/03-backend.yaml)', path: 'devops/k8s/03-backend.yaml' },
  { label: 'Kubernetes Frontend Deployment (devops/k8s/04-frontend.yaml)', path: 'devops/k8s/04-frontend.yaml' },
  { label: 'Windows 1-Click Launch Script (start-dev.bat)', path: 'start-dev.bat' }
];

console.log('[BUILDER] Assembling submission report with paired output screenshots and source codes...');

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Retail Inventory Management System - Complete Code & Output Screenshots Submission</title>
  <style>
    @page {
      size: A4;
      margin: 12mm 12mm 12mm 12mm;
      @bottom-right {
        content: "Page " counter(page);
        font-size: 8pt;
        color: #64748b;
      }
    }
    body {
      font-family: Arial, -apple-system, sans-serif;
      color: #0f172a;
      line-height: 1.4;
      font-size: 9.5pt;
      margin: 0;
      padding: 0;
    }
    .cover-box {
      border: 2px solid #1e40af;
      border-radius: 8px;
      padding: 24px;
      background: #f8fafc;
      text-align: center;
      margin-bottom: 25px;
    }
    .cover-box h1 {
      font-size: 22pt;
      color: #1e3a8a;
      margin: 0 0 8px 0;
    }
    .cover-box .subtitle {
      font-size: 11pt;
      color: #2563eb;
      font-weight: bold;
      margin-bottom: 15px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
      font-size: 9pt;
      text-align: left;
    }
    .meta-table td {
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
    }
    .meta-table td.lbl {
      background: #f1f5f9;
      font-weight: bold;
      width: 28%;
      color: #334155;
    }
    .page-break {
      page-break-after: always;
    }
    .module-header {
      background: #0f172a;
      color: #ffffff;
      padding: 8px 12px;
      border-radius: 6px;
      margin: 25px 0 10px 0;
      page-break-after: avoid;
    }
    .module-header h2 {
      font-size: 13pt;
      margin: 0 0 2px 0;
      color: #38bdf8;
    }
    .module-header p {
      font-size: 8.5pt;
      color: #cbd5e1;
      margin: 0;
    }
    .output-card {
      border: 1px solid #94a3b8;
      border-radius: 6px;
      padding: 8px;
      background: #ffffff;
      margin-bottom: 15px;
      page-break-inside: avoid;
    }
    .output-card .caption {
      font-size: 8.5pt;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 6px;
    }
    .output-card img {
      width: 100%;
      height: auto;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      display: block;
    }
    .code-box {
      margin-bottom: 15px;
      page-break-inside: avoid;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
    }
    .code-title {
      background: #1e293b;
      color: #f8fafc;
      padding: 5px 10px;
      font-size: 8.5pt;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
    }
    .code-title .path {
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
      font-size: 7.2pt;
      line-height: 1.3;
      white-space: pre-wrap;
      word-break: break-all;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover-box">
    <div style="font-size: 9.5pt; font-weight: bold; color: #2563eb; letter-spacing: 1px; margin-bottom: 4px;">
      PROJECT SUBMISSION DOSSIER • FULL STACK DEVELOPMENT
    </div>
    <h1>Retail Inventory Management System</h1>
    <div class="subtitle">Agile Capstone Case Study (P_022) — Source Code with Working Output Screenshots</div>
    <p style="font-size: 9.5pt; color: #475569; margin: 0 auto; max-width: 650px;">
      Complete academic and professional submission dossier pairing every functional retail module's live working output screenshot with its exact frontend, backend, and database source codes.
    </p>

    <table class="meta-table">
      <tr>
        <td class="lbl">Project Code & Title</td>
        <td><strong>P_022</strong> — Retail Inventory Management System</td>
      </tr>
      <tr>
        <td class="lbl">Delivery Framework</td>
        <td>Agile Scrum Methodology (8 Epics, 15 Timeboxed Sprints)</td>
      </tr>
      <tr>
        <td class="lbl">Frontend Technology</td>
        <td>React 18, Vite Bundler, Tailwind CSS, Recharts, Lucide Icons</td>
      </tr>
      <tr>
        <td class="lbl">Backend Technology</td>
        <td>Node.js 24, Express REST API, SQLite (WAL Mode), JWT Authentication, RBAC</td>
      </tr>
      <tr>
        <td class="lbl">Database System</td>
        <td>16 Relational Tables, Foreign Key Cascades, PostgreSQL Migration DDL</td>
      </tr>
      <tr>
        <td class="lbl">DevOps & Cloud</td>
        <td>Docker Compose, Multi-Stage Dockerfiles, Jenkins CI/CD, Kubernetes Manifests</td>
      </tr>
      <tr>
        <td class="lbl">GitHub Repository</td>
        <td><a href="https://github.com/bhawan20/retail-inventory-management-system" style="color:#2563eb; text-decoration:none;">https://github.com/bhawan20/retail-inventory-management-system</a></td>
      </tr>
      <tr>
        <td class="lbl">Project Verification</td>
        <td>100% Complete, Validated & Live Running on http://localhost:3000</td>
      </tr>
    </table>
  </div>
`;

// Insert the 9 Modules (Output Screenshot + Corresponding Source Code)
for (const m of modules) {
  const imgPath = path.join(screenshotsDir, m.screenshot);
  const base64 = imageToBase64(imgPath);

  html += `
  <div class="page-break"></div>
  <div class="module-header">
    <h2>${m.title}</h2>
    <p>${m.description}</p>
  </div>

  <!-- LIVE WORKING OUTPUT SCREENSHOT -->
  <div class="output-card">
    <div class="caption">📸 [WORKING OUTPUT SCREENSHOT] ${m.screenshotCaption}</div>
    <img src="${base64}" alt="${m.title}" />
  </div>

  <div style="font-size: 9pt; font-weight: bold; color: #334155; margin: 10px 0 6px 0;">
    💻 [IMPLEMENTATION SOURCE CODE FILES]
  </div>
  `;

  for (const c of m.codes) {
    const codeContent = readCode(c.path);
    html += `
    <div class="code-box">
      <div class="code-title">
        <span>${c.label}</span>
        <span class="path">${c.path}</span>
      </div>
      <pre><code>${escapeHtml(codeContent)}</code></pre>
    </div>
    `;
  }
}

// Additional Infrastructure Section
html += `
  <div class="page-break"></div>
  <div class="module-header">
    <h2>Module 10: Server Entrypoints, Routing Infrastructure & Cloud DevOps</h2>
    <p>Application root layouts, API routing configuration, containerization, Jenkins CI/CD pipeline, and Kubernetes production manifests.</p>
  </div>
`;

for (const inf of infraCodes) {
  const codeContent = readCode(inf.path);
  html += `
  <div class="code-box">
    <div class="code-title">
      <span>${inf.label}</span>
      <span class="path">${inf.path}</span>
    </div>
    <pre><code>${escapeHtml(codeContent)}</code></pre>
  </div>
  `;
}

html += `
</body>
</html>
`;

fs.writeFileSync(outputHtmlPath, html, 'utf8');
console.log(`[BUILDER] HTML compiled successfully (${(fs.statSync(outputHtmlPath).size / 1024).toFixed(1)} KB)`);

console.log('[BUILDER] Rendering final paired submission PDF via Headless Edge...');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
execSync(`"${edgePath}" --headless --disable-gpu --print-to-pdf="${outputPdfPath}" --print-to-pdf-no-header "${outputHtmlPath}"`, { stdio: 'inherit' });

console.log(`[BUILDER] Final submission PDF ready at: ${outputPdfPath}`);
