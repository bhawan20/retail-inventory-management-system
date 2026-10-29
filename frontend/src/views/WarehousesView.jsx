import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Boxes, 
  Plus, 
  Search, 
  Edit3, 
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Map
} from 'lucide-react';
import { api } from '../services/api';

export default function WarehousesView({ currentRole }) {
  const [warehouses, setWarehouses] = useState([]);
  const [matrixData, setMatrixData] = useState({ warehouses: [], matrix: [] });
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('HUBS'); // HUBS, MATRIX
  const [searchMatrix, setSearchMatrix] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWh, setNewWh] = useState({
    name: '',
    code: '',
    location: '',
    address: '',
    capacity: 100000,
    manager_name: '',
    contact_email: '',
    contact_phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Edit Bin Modal
  const [editBinModal, setEditBinModal] = useState(false);
  const [binForm, setBinForm] = useState({ product_id: '', warehouse_id: '', productName: '', warehouseName: '', bin_location: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [whRes, matrixRes] = await Promise.all([
        api.getWarehouses(),
        api.getInventoryMatrix()
      ]);
      setWarehouses(whRes.warehouses || []);
      setMatrixData(matrixRes || { warehouses: [], matrix: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createWarehouse(newWh);
      setIsAddModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenBinEdit = (prod, wh, currentBin) => {
    setBinForm({
      product_id: prod.id,
      warehouse_id: wh.id,
      productName: prod.name,
      warehouseName: wh.name,
      bin_location: currentBin || 'AISLE-01-A-01'
    });
    setEditBinModal(true);
  };

  const handleSaveBin = async (e) => {
    e.preventDefault();
    try {
      await api.updateBinLocation({
        product_id: binForm.product_id,
        warehouse_id: binForm.warehouse_id,
        bin_location: binForm.bin_location
      });
      setEditBinModal(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredMatrix = matrixData.matrix.filter(item => 
    item.name.toLowerCase().includes(searchMatrix.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchMatrix.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Multi-Warehouse Logistics Network</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic distribution centers, real-time capacity utilization, and bin-level mapping
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Sub Tab Switcher */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('HUBS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'HUBS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Distribution Hubs ({warehouses.length})
            </button>
            <button
              onClick={() => setActiveSubTab('MATRIX')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeSubTab === 'MATRIX' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Matrix (Cross-Site)
            </button>
          </div>

          {currentRole === 'ADMIN' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: HUBS CARDS */}
      {activeSubTab === 'HUBS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map((wh) => {
            const util = wh.utilization_percent || 0;
            const isHigh = util >= 85;

            return (
              <div 
                key={wh.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  
                  {/* Top Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{wh.name}</h3>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                          <span className="font-bold text-slate-600">{wh.code}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-slate-400" />
                            {wh.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {wh.status}
                    </span>
                  </div>

                  {/* Address & Manager */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="text-[11px] text-slate-500">{wh.address}</div>
                    <div className="flex items-center space-x-4 pt-1 text-[11px]">
                      <div className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{wh.manager_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{wh.contact_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Units Stored</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {wh.total_units_stored.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Active SKUs</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {wh.active_skus_count}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Inventory Value</div>
                      <div className="text-base font-bold text-blue-600 mt-0.5">
                        ${wh.total_inventory_value.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Capacity Meter */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Storage Capacity Utilization</span>
                      <span className={isHigh ? 'text-amber-600 font-bold' : 'text-slate-900'}>
                        {util}% ({wh.total_units_stored.toLocaleString()} / {wh.capacity.toLocaleString()} units)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isHigh ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, util)}%` }}
                      />
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: MULTI-WAREHOUSE MATRIX */}
      {activeSubTab === 'MATRIX' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cross-Warehouse Stock Matrix</h3>
              <p className="text-xs text-slate-500">Live breakdown of units and aisle/bin coordinates across all sites</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchMatrix}
                onChange={(e) => setSearchMatrix(e.target.value)}
                placeholder="Filter matrix products..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <th className="py-3 px-4">Product / SKU</th>
                  <th className="py-3 px-3 text-center">Safety Point</th>
                  {matrixData.warehouses.map(wh => (
                    <th key={wh.id} className="py-3 px-3 text-center border-l border-slate-200">
                      <div>{wh.code}</div>
                      <div className="text-[10px] font-normal text-slate-400 font-sans">{wh.name.split(' ')[0]}</div>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-center border-l border-slate-200">Total Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMatrix.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{prod.sku}</div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-medium text-slate-600">
                      {prod.reorder_point}
                    </td>

                    {matrixData.warehouses.map(wh => {
                      const stock = prod.stocks[wh.id] || { quantity: 0, reserved: 0, bin: 'N/A' };
                      const isZero = stock.quantity === 0;
                      const isLow = !isZero && stock.quantity <= 15;

                      return (
                        <td key={wh.id} className="py-3 px-3 text-center border-l border-slate-100">
                          <div className={`font-bold ${isZero ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>
                            {stock.quantity} units
                          </div>
                          <div className="flex items-center justify-center space-x-1 mt-0.5">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                              {stock.bin || 'N/A'}
                            </span>
                            <button
                              onClick={() => handleOpenBinEdit(prod, wh, stock.bin)}
                              className="text-slate-400 hover:text-blue-600"
                              title="Edit Bin Coordinate"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-center border-l border-slate-100">
                      <span className={`text-sm font-bold ${
                        prod.is_out_of_stock ? 'text-rose-600' : prod.is_low_stock ? 'text-amber-600' : 'text-emerald-700'
                      }`}>
                        {prod.total_quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* MODAL: ADD NEW WAREHOUSE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Warehouse className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Add Distribution Warehouse</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Name *</label>
                <input
                  type="text"
                  required
                  value={newWh.name}
                  onChange={(e) => setNewWh({ ...newWh, name: e.target.value })}
                  placeholder="e.g. South Atlantic Distribution Center (Atlanta)"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={newWh.code}
                    onChange={(e) => setNewWh({ ...newWh, code: e.target.value.toUpperCase() })}
                    placeholder="WH-ATL-05"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location City/State *</label>
                  <input
                    type="text"
                    required
                    value={newWh.location}
                    onChange={(e) => setNewWh({ ...newWh, location: e.target.value })}
                    placeholder="Atlanta, GA"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Physical Street Address</label>
                <input
                  type="text"
                  value={newWh.address}
                  onChange={(e) => setNewWh({ ...newWh, address: e.target.value })}
                  placeholder="2400 Logistics Blvd, Atlanta, GA 30344"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity (Units) *</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newWh.capacity}
                    onChange={(e) => setNewWh({ ...newWh, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Site Director / Manager</label>
                  <input
                    type="text"
                    value={newWh.manager_name}
                    onChange={(e) => setNewWh({ ...newWh, manager_name: e.target.value })}
                    placeholder="Marcus Vance"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newWh.contact_email}
                    onChange={(e) => setNewWh({ ...newWh, contact_email: e.target.value })}
                    placeholder="atlanta.wh@retailhub.com"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newWh.contact_phone}
                    onChange={(e) => setNewWh({ ...newWh, contact_phone: e.target.value })}
                    placeholder="+1 (404) 555-0199"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow"
                >
                  {submitting ? 'Registering...' : 'Register Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BIN LOCATION */}
      {editBinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-sm text-slate-900 mb-1">Update Aisle/Bin Location</h3>
            <p className="text-xs text-slate-500 mb-4">
              {binForm.productName} in <strong className="text-slate-700">{binForm.warehouseName}</strong>
            </p>

            <form onSubmit={handleSaveBin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bin Coordinate *</label>
                <input
                  type="text"
                  required
                  value={binForm.bin_location}
                  onChange={(e) => setBinForm({ ...binForm, bin_location: e.target.value.toUpperCase() })}
                  placeholder="AISLE-03-B-12"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditBinModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Save Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
