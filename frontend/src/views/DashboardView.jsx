import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Package, 
  AlertTriangle, 
  Warehouse, 
  Truck, 
  ShoppingBag, 
  ArrowUpRight, 
  TrendingUp, 
  Clock, 
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend 
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DashboardView({ onNavigate, onReorderProduct }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalytics();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500 font-medium">Aggregating multi-warehouse retail metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-rose-800">Failed to load dashboard metrics</h3>
          <p className="text-xs text-rose-600 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, warehouseDistribution, categoryBreakdown, monthlyFlow, recentActivities } = data;

  return (
    <div className="space-y-6">
      
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Inventory Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time multi-echelon stock health, procurement pipeline, and fulfillment KPIs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Manage Catalog</span>
          </button>
        </div>
      </div>

      {/* Critical Stockout Alert Banner */}
      {kpis.low_stock_count > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Action Required: {kpis.low_stock_count} item(s) breached reorder safety thresholds!
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                {kpis.out_of_stock_count > 0 ? `${kpis.out_of_stock_count} item(s) currently completely out of stock.` : 'Immediate supplier purchase orders recommended.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('purchase-orders')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow transition-all"
          >
            Open Purchase Order
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Valuation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inventory Valuation</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              ${kpis.total_cost_value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-slate-500">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ${kpis.total_retail_value.toLocaleString()}
              </span>
              <span>Retail Value</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Potential Profit:</span>
            <span className="font-semibold text-emerald-600">+${kpis.potential_profit.toLocaleString()}</span>
          </div>
        </div>

        {/* Card 2: Total Units */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Units in Distribution</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {kpis.total_units_in_stock.toLocaleString()} units
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-slate-500">
              <span className="text-slate-700 font-medium">{kpis.available_units.toLocaleString()} Available</span>
              <span>•</span>
              <span className="text-amber-600 font-medium">{kpis.total_reserved_units} Reserved</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Across Active Sites:</span>
            <span className="font-semibold text-slate-700">{kpis.warehouses_count} Regional Hubs</span>
          </div>
        </div>

        {/* Card 3: Stockout Risk */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Health</span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpis.low_stock_count > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold ${kpis.low_stock_count > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {kpis.low_stock_count} Reorder Alerts
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-slate-500">
              <span className="text-rose-600 font-semibold">{kpis.out_of_stock_count} Zero Stock</span>
              <span>items currently</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Active Suppliers:</span>
            <span className="font-semibold text-slate-700">{kpis.suppliers_count} Vendors</span>
          </div>
        </div>

        {/* Card 4: Orders & Fulfillment */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fulfillment & Orders</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {kpis.pending_orders_count} Pending Dispatch
            </div>
            <div className="flex items-center space-x-1 mt-1 text-xs text-slate-500">
              <span className="text-blue-600 font-semibold">{kpis.open_pos_count} Inbound POs</span>
              <span>awaiting delivery</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sales Revenue:</span>
            <span className="font-semibold text-indigo-600">${kpis.total_sales_revenue.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Stock Balance by Regional Warehouse */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Warehouse Inventory Distribution</h3>
              <p className="text-xs text-slate-500">Stored physical units across regional fulfillment hubs</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
              Live Capacity
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="code" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val, name) => [val.toLocaleString() + ' units', 'Stored Quantity']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="units_stored" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Valuation Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventory Valuation by Category</h3>
              <p className="text-xs text-slate-500">Capital tied up in stock across product classifications</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              Cost Basis
            </span>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="category_value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                  label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val) => ['$' + Number(val).toLocaleString(), 'Value']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Inbound vs Outbound Inventory Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inbound vs Outbound Velocity ($)</h3>
              <p className="text-xs text-slate-500">6-Month procurement receipts vs sales fulfillment throughput</p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-medium">
              <span className="flex items-center text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5" />
                Inbound POs
              </span>
              <span className="flex items-center text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
                Sales Outbound
              </span>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFlow} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(val) => ['$' + Number(val).toLocaleString(), '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#inboundGrad)" name="Inbound PO" />
                <Area type="monotone" dataKey="outbound" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#outboundGrad)" name="Sales Fulfillment" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Activity Audit Trail */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Recent Supply Chain Activity Feed</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Immutable Audit Trail</span>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivities.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No audit records logged yet.</p>
          ) : (
            recentActivities.map((act) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                    act.action.includes('RECEIVE') || act.action.includes('SHIP')
                      ? 'bg-emerald-100 text-emerald-700'
                      : act.action.includes('ADJUST')
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {act.action}
                  </span>
                  <span className="text-slate-700 font-medium">{act.details}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
                  <span>by <strong className="text-slate-600 font-medium">{act.user_name}</strong></span>
                  <span>{new Date(act.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
