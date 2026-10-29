import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Warehouse, 
  ArrowLeftRight, 
  Truck, 
  FileText, 
  ShoppingBag, 
  KanbanSquare, 
  Network,
  Sparkles,
  ClipboardList
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, lowStockCount, pendingOrdersCount, openPosCount }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'products',
      label: 'Product Catalog',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} alert` : null,
      badgeColor: 'bg-amber-500/20 text-amber-600 border border-amber-300'
    },
    {
      id: 'warehouses',
      label: 'Multi-Warehouse',
      icon: Warehouse,
      badge: '4 Hubs'
    },
    {
      id: 'transfers',
      label: 'Transfers & Audits',
      icon: ArrowLeftRight,
      badge: null
    },
    {
      id: 'suppliers',
      label: 'Supplier Management',
      icon: Truck,
      badge: null
    },
    {
      id: 'purchase-orders',
      label: 'Procurement & POs',
      icon: FileText,
      badge: openPosCount > 0 ? `${openPosCount} active` : null,
      badgeColor: 'bg-blue-50 text-blue-600 border border-blue-200'
    },
    {
      id: 'sales-orders',
      label: 'Order Fulfillment',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} to fulfill` : null,
      badgeColor: 'bg-emerald-50 text-emerald-600 border border-emerald-200'
    },
    {
      id: 'divider',
      isDivider: true,
      label: 'Agile Capstone Deliverables'
    },
    {
      id: 'agile',
      label: 'Scrum Board & 15 Sprints',
      icon: KanbanSquare,
      badge: '8 Epics',
      badgeColor: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold',
      highlight: true
    },
    {
      id: 'architecture',
      label: 'System Architecture & ERD',
      icon: Network,
      badge: 'Specs'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] shadow-sm">
      <div className="p-4 flex-1">
        <div className="space-y-1">
          {navItems.map((item, index) => {
            if (item.isDivider) {
              return (
                <div key={index} className="pt-4 pb-2 px-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </div>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : item.highlight
                    ? 'bg-purple-50 text-purple-900 hover:bg-purple-100/80 border border-purple-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-purple-600' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Capstone Badge Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center space-x-2 text-xs text-slate-600 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-800">Agile Scrum Case Study</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Product Catalog, Multi-Warehouse, Fulfillment, Suppliers, Jenkins CI/CD & Kubernetes.
        </p>
      </div>
    </aside>
  );
}
