import React, { useState } from 'react';
import { 
  Network, 
  Database, 
  Server, 
  Monitor, 
  Container, 
  GitBranch, 
  FileCode, 
  CheckCircle2, 
  Layers, 
  Key,
  ShieldCheck
} from 'lucide-react';

export default function ArchitectureView() {
  const [activeSection, setActiveSection] = useState('SYSTEM_ARCH'); // SYSTEM_ARCH, ERD, API_SPEC, DEVOPS

  const apiEndpoints = [
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticate user & issue signed JWT', role: 'Public' },
    { method: 'GET', path: '/api/auth/me', desc: 'Retrieve current authenticated session & role', role: 'All Roles' },
    { method: 'GET', path: '/api/products', desc: 'List product catalog with search, category & stock status filters', role: 'All Roles' },
    { method: 'POST', path: '/api/products', desc: 'Create new SKU master with multi-warehouse initial allocations', role: 'Admin, Wh Manager' },
    { method: 'GET', path: '/api/warehouses', desc: 'List regional distribution hubs with capacity utilization', role: 'All Roles' },
    { method: 'POST', path: '/api/warehouses', desc: 'Register new regional fulfillment warehouse', role: 'Admin' },
    { method: 'GET', path: '/api/inventory/matrix', desc: 'Multi-warehouse stock cross-reference matrix', role: 'All Roles' },
    { method: 'POST', path: '/api/inventory/adjust', desc: 'Record cycle count or damage variance with audit trail', role: 'Admin, Wh Manager, Clerk' },
    { method: 'PUT', path: '/api/inventory/bin-location', desc: 'Update physical aisle/bin coordinates', role: 'Admin, Wh Manager, Clerk' },
    { method: 'GET', path: '/api/transfers', desc: 'Query inter-warehouse stock transfer orders', role: 'All Roles' },
    { method: 'POST', path: '/api/transfers', desc: 'Initiate stock transfer with origin availability validation', role: 'Admin, Wh Manager, Clerk' },
    { method: 'PUT', path: '/api/transfers/:id/dispatch', desc: 'Dispatch transfer & deduct source warehouse balance', role: 'Admin, Wh Manager, Clerk' },
    { method: 'PUT', path: '/api/transfers/:id/receive', desc: 'Confirm arrival & increment destination warehouse stock', role: 'Admin, Wh Manager, Clerk' },
    { method: 'GET', path: '/api/suppliers', desc: 'List supplier directory with ratings & lead times', role: 'All Roles' },
    { method: 'POST', path: '/api/purchase-orders', desc: 'Create multi-line purchase order commitment', role: 'Admin, Procurement' },
    { method: 'PUT', path: '/api/purchase-orders/:id/receive', desc: 'Post Goods Receipt Note (GRN) & auto-increment warehouse stock', role: 'Admin, Wh Manager, Clerk' },
    { method: 'GET', path: '/api/sales-orders', desc: 'List customer sales orders by fulfillment stage', role: 'All Roles' },
    { method: 'POST', path: '/api/sales-orders', desc: 'Create customer sales order & soft-reserve warehouse stock', role: 'Admin, Sales Rep' },
    { method: 'PUT', path: '/api/sales-orders/:id/status', desc: 'Advance Pick-Pack-Ship stage & deduct physical stock on ship', role: 'Admin, Wh Manager, Clerk' },
    { method: 'GET', path: '/api/analytics/overview', desc: 'Executive KPI metrics, valuation, and Recharts series', role: 'All Roles' },
    { method: 'GET', path: '/api/agile/overview', desc: 'Agile Capstone: 8 Epics & 15 Sprints progress', role: 'All Roles' },
    { method: 'PUT', path: '/api/agile/stories/:id/status', desc: 'Update Scrum Kanban user story column status', role: 'All Roles' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Architecture & Technical Specifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full stack enterprise architecture, database schema entity-relationships, REST endpoints, and cloud containerization
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex bg-slate-200/80 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setActiveSection('SYSTEM_ARCH')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSection === 'SYSTEM_ARCH' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tiered Architecture
          </button>
          <button
            onClick={() => setActiveSection('ERD')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSection === 'ERD' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Database ERD
          </button>
          <button
            onClick={() => setActiveSection('API_SPEC')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSection === 'API_SPEC' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            REST API Spec
          </button>
          <button
            onClick={() => setActiveSection('DEVOPS')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeSection === 'DEVOPS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CI/CD & Kubernetes
          </button>
        </div>
      </div>

      {/* VIEW 1: SYSTEM ARCHITECTURE */}
      {activeSection === 'SYSTEM_ARCH' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center">
              <Network className="w-4 h-4 mr-2 text-blue-600" />
              Four-Tier Enterprise Full Stack Architecture
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Tier 1: Client */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-blue-600 mb-2">
                    <Monitor className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">Presentation Tier</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">React 18 + Vite</h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <li>• Modern SPA with Vite bundler</li>
                    <li>• Tailwind CSS for responsive UI</li>
                    <li>• Lucide React icons</li>
                    <li>• Recharts interactive charts</li>
                    <li>• Real-time stock matrix grids</li>
                    <li>• Interactive Scrum Kanban board</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                  Port: 3000 / Nginx
                </div>
              </div>

              {/* Tier 2: API */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                    <Server className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">API Application Tier</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Node.js + Express</h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <li>• Modular RESTful Route Controllers</li>
                    <li>• JWT Authentication & Sessions</li>
                    <li>• Role-Based Access Control (RBAC)</li>
                    <li>• Atomic stock transfer logic</li>
                    <li>• Reservation & fulfillment stepper</li>
                    <li>• Comprehensive Audit Logger</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                  Port: 5000 / REST
                </div>
              </div>

              {/* Tier 3: Database */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-600 mb-2">
                    <Database className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">Persistence Tier</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">SQLite & PostgreSQL</h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <li>• Built-in zero-config SQLite</li>
                    <li>• WAL journal mode for performance</li>
                    <li>• Foreign key cascades & indexes</li>
                    <li>• PostgreSQL migration DDL</li>
                    <li>• 16 relational normalized tables</li>
                    <li>• Pre-seeded capstone dataset</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                  Data: /data/retail_inventory.db
                </div>
              </div>

              {/* Tier 4: DevOps */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-purple-600 mb-2">
                    <Container className="w-5 h-5" />
                    <span className="font-bold text-xs uppercase tracking-wider">DevOps & Cloud</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Docker & Kubernetes</h4>
                  <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <li>• Multi-stage Dockerfiles</li>
                    <li>• Docker Compose orchestration</li>
                    <li>• Jenkins Declarative Pipeline</li>
                    <li>• K8s Deployment & Services</li>
                    <li>• Ingress load balancer YAML</li>
                    <li>• Healthcheck probes</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-500">
                  Pipeline: Jenkinsfile
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DATABASE ERD */}
      {activeSection === 'ERD' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center">
            <Database className="w-4 h-4 mr-2 text-emerald-600" />
            Relational Database Schema (ERD Entities)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            
            {/* Products & Inventory */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-blue-700 pb-2 border-b border-slate-200 font-sans">
                PRODUCTS (Master SKU)
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <div><strong className="text-slate-900">id</strong> TEXT PK</div>
                <div><strong className="text-slate-900">sku</strong> TEXT UNIQUE</div>
                <div>name TEXT</div>
                <div>category_id TEXT FK</div>
                <div>barcode TEXT</div>
                <div>unit_price REAL</div>
                <div>cost_price REAL</div>
                <div>reorder_point INT</div>
                <div>reorder_quantity INT</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-emerald-700 pb-2 border-b border-slate-200 font-sans">
                INVENTORY (Stock Levels)
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <div><strong className="text-slate-900">id</strong> TEXT PK</div>
                <div><strong className="text-slate-900">product_id</strong> TEXT FK</div>
                <div><strong className="text-slate-900">warehouse_id</strong> TEXT FK</div>
                <div>quantity INT</div>
                <div>reserved_quantity INT</div>
                <div>bin_location TEXT</div>
                <div>last_audit_date DATE</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-indigo-700 pb-2 border-b border-slate-200 font-sans">
                WAREHOUSES (Facilities)
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <div><strong className="text-slate-900">id</strong> TEXT PK</div>
                <div><strong className="text-slate-900">code</strong> TEXT UNIQUE</div>
                <div>name TEXT</div>
                <div>location TEXT</div>
                <div>capacity INT</div>
                <div>manager_name TEXT</div>
                <div>status TEXT</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-amber-700 pb-2 border-b border-slate-200 font-sans">
                PURCHASE_ORDERS (Procurement)
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <div><strong className="text-slate-900">id</strong> TEXT PK</div>
                <div><strong className="text-slate-900">po_number</strong> TEXT UNIQUE</div>
                <div>supplier_id TEXT FK</div>
                <div>destination_warehouse_id TEXT FK</div>
                <div>status TEXT</div>
                <div>total_amount REAL</div>
                <div>order_date DATE</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-purple-700 pb-2 border-b border-slate-200 font-sans">
                SALES_ORDERS (Fulfillment)
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <div><strong className="text-slate-900">id</strong> TEXT PK</div>
                <div><strong className="text-slate-900">order_number</strong> TEXT UNIQUE</div>
                <div>customer_name TEXT</div>
                <div>fulfillment_warehouse_id TEXT FK</div>
                <div>status (PENDING/SHIPPED)</div>
                <div>total_amount REAL</div>
                <div>tracking_number TEXT</div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="font-bold text-cyan-700 pb-2 border-b border-slate-200 font-sans">
                STOCK_TRANSFERS (Logistics)
              </div>
              <div className="mt-2 space-y-1 text-slate-600">
                <div><strong className="text-slate-900">id</strong> TEXT PK</div>
                <div><strong className="text-slate-900">transfer_number</strong> TEXT UNIQUE</div>
                <div>source_warehouse_id TEXT FK</div>
                <div>dest_warehouse_id TEXT FK</div>
                <div>product_id TEXT FK</div>
                <div>quantity INT</div>
                <div>status (IN_TRANSIT)</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* VIEW 3: REST API SPECIFICATION */}
      {activeSection === 'API_SPEC' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">HTTP Method</th>
                  <th className="py-3 px-4">Endpoint URI</th>
                  <th className="py-3 px-4">Functional Description</th>
                  <th className="py-3 px-4">RBAC Authorization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apiEndpoints.map((ep, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-700'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-700'
                          : ep.method === 'PUT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {ep.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-800 font-semibold">{ep.path}</td>
                    <td className="py-2.5 px-4 text-slate-600">{ep.desc}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-700">{ep.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: CI/CD & KUBERNETES */}
      {activeSection === 'DEVOPS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center">
            <Container className="w-4 h-4 mr-2 text-purple-600" />
            DevOps CI/CD Automation & Production Kubernetes Manifests
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                <GitBranch className="w-4 h-4 mr-1.5 text-blue-600" />
                Jenkins Declarative CI/CD Pipeline Stages
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600">
                <li><strong>Checkout Source:</strong> Pulls from Git branch</li>
                <li><strong>Install & Test Backend:</strong> Runs linters and route health checks</li>
                <li><strong>Frontend Build:</strong> Compiles Vite production bundle</li>
                <li><strong>Docker Build:</strong> Builds multi-stage images for backend & frontend</li>
                <li><strong>Container Security Scan:</strong> Trivy vulnerability scan</li>
                <li><strong>Publish to Registry:</strong> Pushes tagged images to container registry</li>
                <li><strong>Kubernetes Rolling Deploy:</strong> Applies deployment YAML manifests</li>
              </ol>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                <FileCode className="w-4 h-4 mr-1.5 text-purple-600" />
                Included DevOps Manifests
              </h4>
              <ul className="space-y-1.5 text-slate-600 font-mono text-[11px]">
                <li>• <code>devops/Dockerfile.backend</code> (Node 24 multi-stage)</li>
                <li>• <code>devops/Dockerfile.frontend</code> (Vite + Nginx)</li>
                <li>• <code>devops/docker-compose.yml</code> (Fullstack orchestration)</li>
                <li>• <code>devops/Jenkinsfile</code> (Declarative pipeline)</li>
                <li>• <code>devops/k8s/backend-deployment.yaml</code></li>
                <li>• <code>devops/k8s/frontend-deployment.yaml</code></li>
                <li>• <code>devops/k8s/ingress.yaml</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
