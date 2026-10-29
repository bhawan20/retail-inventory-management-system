import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Bell, 
  ShieldCheck, 
  User, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Navbar({ currentRole, onRoleChange, lowStockCount, onOpenAlerts }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const roles = [
    { id: 'ADMIN', label: 'System Admin (Full Access)', desc: 'Alex Morgan' },
    { id: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager', desc: 'Marcus Vance' },
    { id: 'INVENTORY_CLERK', label: 'Inventory Specialist', desc: 'Sarah Jenkins' },
    { id: 'PROCUREMENT_MANAGER', label: 'Procurement Specialist', desc: 'David Chen' },
    { id: 'SALES_REP', label: 'Order Fulfillment Lead', desc: 'Emily Watson' }
  ];

  const currentRoleObj = roles.find(r => r.id === currentRole) || roles[0];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Capstone Tag */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Boxes className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                RetailHub Inventory
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Agile Capstone P_022
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Multi-Warehouse Distribution • 8 Epics & 15 Sprints
            </p>
          </div>
        </div>

        {/* Right: Actions, Role Switcher, Low Stock Badge */}
        <div className="flex items-center space-x-4">
          
          {/* Live System Time */}
          <div className="hidden lg:flex items-center text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
            LIVE API: 5000 • {time}
          </div>

          {/* Low Stock Alerts Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors flex items-center space-x-1"
            title="Low Stock & Reorder Warnings"
          >
            <Bell className="w-5 h-5 text-amber-400" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-slate-900 animate-bounce">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Evaluator Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-800/80 hover:from-slate-700 hover:to-slate-750 px-3 py-1.5 rounded-xl border border-slate-700 text-left transition-all shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentRoleObj.label}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentRoleObj.desc}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-2 border-b border-slate-700/80">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                    Switch Evaluator Role (RBAC)
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Test role-based views and action permissions
                  </p>
                </div>
                {roles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onRoleChange(r.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-700/70 transition-colors ${
                      r.id === currentRole ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.desc}</div>
                    </div>
                    {r.id === currentRole && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
