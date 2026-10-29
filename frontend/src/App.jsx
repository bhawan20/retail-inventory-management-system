import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import ProductsView from './views/ProductsView';
import WarehousesView from './views/WarehousesView';
import TransfersView from './views/TransfersView';
import SuppliersView from './views/SuppliersView';
import PurchaseOrdersView from './views/PurchaseOrdersView';
import SalesOrdersView from './views/SalesOrdersView';
import AgileCapstoneView from './views/AgileCapstoneView';
import ArchitectureView from './views/ArchitectureView';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState(
    localStorage.getItem('retail_user_role') || 'ADMIN'
  );
  
  // Quick badge counters
  const [lowStockCount, setLowStockCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [openPosCount, setOpenPosCount] = useState(0);

  const fetchGlobalBadges = async () => {
    try {
      const res = await api.getAnalytics();
      if (res && res.kpis) {
        setLowStockCount(res.kpis.low_stock_count || 0);
        setPendingOrdersCount(res.kpis.pending_orders_count || 0);
        setOpenPosCount(res.kpis.open_pos_count || 0);
      }
    } catch (err) {
      console.warn('Badges poll warning:', err.message);
    }
  };

  useEffect(() => {
    fetchGlobalBadges();
    const interval = setInterval(fetchGlobalBadges, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('retail_user_role', newRole);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased">
      {/* Top Header Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        lowStockCount={lowStockCount}
        onOpenAlerts={() => setActiveTab('products')}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          lowStockCount={lowStockCount}
          pendingOrdersCount={pendingOrdersCount}
          openPosCount={openPosCount}
        />

        {/* Main Workspace Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onReorderProduct={() => setActiveTab('purchase-orders')}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              currentRole={currentRole}
              onReorder={() => setActiveTab('purchase-orders')}
            />
          )}

          {activeTab === 'warehouses' && (
            <WarehousesView currentRole={currentRole} />
          )}

          {activeTab === 'transfers' && (
            <TransfersView currentRole={currentRole} />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersView currentRole={currentRole} />
          )}

          {activeTab === 'purchase-orders' && (
            <PurchaseOrdersView currentRole={currentRole} />
          )}

          {activeTab === 'sales-orders' && (
            <SalesOrdersView currentRole={currentRole} />
          )}

          {activeTab === 'agile' && (
            <AgileCapstoneView />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureView />
          )}
        </main>
      </div>
    </div>
  );
}
