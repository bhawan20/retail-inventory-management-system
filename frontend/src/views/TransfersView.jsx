import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  Plus, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Warehouse, 
  AlertCircle, 
  RefreshCw,
  ClipboardCheck,
  Send,
  CornerDownRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

export default function TransfersView({ currentRole }) {
  const [transfers, setTransfers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TRANSFERS'); // TRANSFERS, ADJUSTMENTS

  // Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    source_warehouse_id: '',
    dest_warehouse_id: '',
    product_id: '',
    quantity: 10,
    tracking_notes: ''
  });

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    warehouse_id: '',
    product_id: '',
    adjustment_type: 'CYCLE_COUNT',
    quantity_delta: 1,
    reason: ''
  });

  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trfRes, whRes, prodRes] = await Promise.all([
        api.getTransfers(),
        api.getWarehouses(),
        api.getProducts()
      ]);
      setTransfers(trfRes.transfers || []);
      setWarehouses(whRes.warehouses || []);
      setProducts(prodRes.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createTransfer(transferForm);
      setIsTransferModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispatch = async (id) => {
    if (confirm('Dispatch this transfer? Stock will be atomically deducted from source warehouse.')) {
      try {
        await api.dispatchTransfer(id);
        await loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleReceive = async (id) => {
    if (confirm('Confirm arrival and receiving into destination warehouse?')) {
      try {
        await api.receiveTransfer(id);
        await loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.adjustStock(adjustForm);
      setIsAdjustModalOpen(false);
      alert('Physical stock adjustment recorded and audit log posted.');
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inter-Warehouse Transfers & Audits</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional stock rebalancing pipeline with dispatch locking and physical count variance auditing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sub Tab Switcher */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('TRANSFERS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'TRANSFERS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transfer Orders ({transfers.length})
            </button>
            <button
              onClick={() => setActiveTab('ADJUSTMENTS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'ADJUSTMENTS' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stock Audits / Variance
            </button>
          </div>

          <button
            onClick={() => {
              if (activeTab === 'TRANSFERS') {
                setTransferForm({
                  source_warehouse_id: warehouses[0]?.id || '',
                  dest_warehouse_id: warehouses[1]?.id || '',
                  product_id: products[0]?.id || '',
                  quantity: 15,
                  tracking_notes: ''
                });
                setIsTransferModalOpen(true);
              } else {
                setAdjustForm({
                  warehouse_id: warehouses[0]?.id || '',
                  product_id: products[0]?.id || '',
                  adjustment_type: 'CYCLE_COUNT',
                  quantity_delta: 2,
                  reason: 'Cycle count variance verified on physical shelf'
                });
                setIsAdjustModalOpen(true);
              }
            }}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'TRANSFERS' ? 'Initiate Transfer' : 'Record Adjustment'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: INTER-WAREHOUSE TRANSFERS */}
      {activeTab === 'TRANSFERS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Transfer Number</th>
                    <th className="py-3 px-4">Origin & Destination</th>
                    <th className="py-3 px-4">Product Transferred</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Initiated By</th>
                    <th className="py-3 px-4 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        No active stock transfers found.
                      </td>
                    </tr>
                  ) : (
                    transfers.map(trf => {
                      const isPending = trf.status === 'PENDING';
                      const isInTransit = trf.status === 'IN_TRANSIT';
                      const isReceived = trf.status === 'RECEIVED';

                      return (
                        <tr key={trf.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* Number & Date */}
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900">{trf.transfer_number}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(trf.created_at).toLocaleDateString()}
                            </div>
                          </td>

                          {/* Route */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-800">{trf.source_warehouse_code}</span>
                              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-500" />
                              <span className="font-bold text-indigo-700">{trf.dest_warehouse_code}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                              {trf.tracking_notes || 'Standard regional replenishment'}
                            </div>
                          </td>

                          {/* Product */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{trf.product_name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{trf.product_sku}</div>
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded-lg">
                              {trf.quantity} units
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            {isPending && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <Clock className="w-3 h-3 mr-1" /> Pending Dispatch
                              </span>
                            )}
                            {isInTransit && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                                <Truck className="w-3 h-3 mr-1" /> In Transit
                              </span>
                            )}
                            {isReceived && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Received & Stored
                              </span>
                            )}
                          </td>

                          {/* Initiated By */}
                          <td className="py-3 px-4 text-slate-600">
                            <div>{trf.initiated_by}</div>
                            {trf.dispatched_at && (
                              <div className="text-[10px] text-slate-400">
                                Disp: {new Date(trf.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isPending && (
                                <button
                                  onClick={() => handleDispatch(trf.id)}
                                  className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-all"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Dispatch</span>
                                </button>
                              )}
                              {isInTransit && (
                                <button
                                  onClick={() => handleReceive(trf.id)}
                                  className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-all"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Confirm Receive</span>
                                </button>
                              )}
                              {isReceived && (
                                <span className="text-[11px] text-slate-400 font-mono">
                                  Complete
                                </span>
                              )}
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK AUDITS & ADJUSTMENTS */}
      {activeTab === 'ADJUSTMENTS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Physical Stock Count Adjustments & Audit Records</h3>
              <p className="text-xs text-slate-500">Cycle count reconciliations, shrinkage adjustments, and damage write-offs</p>
            </div>
            <button
              onClick={() => setIsAdjustModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl"
            >
              New Audit Entry
            </button>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Agile Inventory Integrity Rule (Epic 4 / Sprint 8):</strong>
              <p className="mt-0.5">
                All physical stock variances directly adjust the real-time warehouse inventory ledger and automatically generate an immutable audit log entry detailing user, reason code, and timestamp.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INITIATE TRANSFER */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Initiate Inter-Warehouse Transfer</h3>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Warehouse (Origin) *</label>
                  <select
                    required
                    value={transferForm.source_warehouse_id}
                    onChange={(e) => setTransferForm({ ...transferForm, source_warehouse_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code} - {w.location}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Warehouse *</label>
                  <select
                    required
                    value={transferForm.dest_warehouse_id}
                    onChange={(e) => setTransferForm({ ...transferForm, dest_warehouse_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.code} - {w.location}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product to Transfer *</label>
                <select
                  required
                  value={transferForm.product_id}
                  onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transfer Quantity (Units) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Logistics & Tracking Notes</label>
                <textarea
                  rows="2"
                  value={transferForm.tracking_notes}
                  onChange={(e) => setTransferForm({ ...transferForm, tracking_notes: e.target.value })}
                  placeholder="e.g. Expedited freight transfer via Interstate Truck #402"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow"
                >
                  {submitting ? 'Creating...' : 'Submit Transfer Order'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: PHYSICAL STOCK ADJUSTMENT */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ClipboardCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Record Stock Adjustment</h3>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAdjustment} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Facility *</label>
                <select
                  required
                  value={adjustForm.warehouse_id}
                  onChange={(e) => setAdjustForm({ ...adjustForm, warehouse_id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product *</label>
                <select
                  required
                  value={adjustForm.product_id}
                  onChange={(e) => setAdjustForm({ ...adjustForm, product_id: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason Code *</label>
                  <select
                    value={adjustForm.adjustment_type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, adjustment_type: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="CYCLE_COUNT">Cycle Count Variance</option>
                    <option value="DAMAGE">Damaged Carton/Item</option>
                    <option value="THEFT">Shrinkage / Discrepancy</option>
                    <option value="FOUND">Found Uncataloged Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Delta (+ or -) *</label>
                  <input
                    type="number"
                    required
                    value={adjustForm.quantity_delta}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity_delta: Number(e.target.value) })}
                    placeholder="+2 or -1"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Explanation Note *</label>
                <textarea
                  rows="2"
                  required
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  placeholder="Explain why the physical inventory differed from the system balance..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold shadow"
                >
                  {submitting ? 'Applying...' : 'Post Stock Adjustment'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
