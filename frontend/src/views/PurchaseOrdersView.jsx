import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Warehouse, 
  Truck, 
  Eye, 
  Trash2, 
  RefreshCw, 
  DollarSign, 
  Printer, 
  PackageCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function PurchaseOrdersView({ currentRole, defaultProductId, onClearDefaultProduct }) {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    supplier_id: '',
    destination_warehouse_id: '',
    expected_delivery: '',
    notes: '',
    items: [
      { product_id: '', quantity: 50, unit_cost: 0 }
    ]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [poRes, supRes, whRes, prodRes] = await Promise.all([
        api.getPurchaseOrders(statusFilter ? { status: statusFilter } : {}),
        api.getSuppliers(),
        api.getWarehouses(),
        api.getProducts()
      ]);
      setOrders(poRes.orders || []);
      setSuppliers(supRes.suppliers || []);
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
  }, [statusFilter]);

  const handleOpenCreate = () => {
    const firstProd = products[0];
    setFormData({
      supplier_id: suppliers[0]?.id || '',
      destination_warehouse_id: warehouses[0]?.id || '',
      expected_delivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      notes: 'Standard stock replenishment for regional fulfillment',
      items: [
        { product_id: firstProd?.id || '', quantity: 50, unit_cost: firstProd?.cost_price || 0 }
      ]
    });
    setIsCreateModalOpen(true);
  };

  const handleAddItemRow = () => {
    const firstProd = products[0];
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: firstProd?.id || '', quantity: 25, unit_cost: firstProd?.cost_price || 0 }]
    }));
  };

  const handleRemoveItemRow = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value,
        unit_cost: prod ? prod.cost_price : 0
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unit_cost || 0)), 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createPurchaseOrder(formData);
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiveOrder = async (poId, poNumber) => {
    if (confirm(`Confirm receipt for ${poNumber}? Warehouse physical inventory will be automatically incremented.`)) {
      try {
        await api.receivePurchaseOrder(poId);
        alert(`Shipment received successfully! Inventory updated across warehouse ledger.`);
        await loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleViewOrder = async (id) => {
    try {
      const res = await api.getPurchaseOrderById(id);
      setViewOrder(res);
      setIsViewModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Orders & Goods Receipt (GRN)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement replenishment cycle, vendor order tracking, and automated inventory receiving
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
          >
            <option value="">All PO Statuses</option>
            <option value="ORDERED">Ordered (Inbound)</option>
            <option value="RECEIVED">Received & Stocked</option>
            <option value="DRAFT">Draft</option>
          </select>

          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {(currentRole === 'ADMIN' || currentRole === 'PROCUREMENT_MANAGER') && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Purchase Order</span>
            </button>
          )}
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">PO Number & Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Destination Warehouse</th>
                <th className="py-3 px-4 text-center">Units Ordered</th>
                <th className="py-3 px-4 text-right">Order Value</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                orders.map((po) => {
                  const isOrdered = po.status === 'ORDERED';
                  const isReceived = po.status === 'RECEIVED';
                  const isDraft = po.status === 'DRAFT';

                  return (
                    <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Number */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{po.po_number}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Ordered: {po.order_date}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{po.supplier_name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{po.supplier_code}</div>
                      </td>

                      {/* Warehouse */}
                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center space-x-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium">{po.destination_warehouse_code}</span>
                        </div>
                      </td>

                      {/* Units */}
                      <td className="py-3 px-4 text-center font-bold text-slate-900">
                        {po.total_units_ordered} units
                      </td>

                      {/* Value */}
                      <td className="py-3 px-4 text-right font-bold text-blue-600">
                        ${po.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isOrdered && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Clock className="w-3 h-3 mr-1" /> Inbound / Ordered
                          </span>
                        )}
                        {isReceived && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Goods Received (GRN)
                          </span>
                        )}
                        {isDraft && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Draft PO
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewOrder(po.id)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View PO Details & Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isOrdered && (currentRole === 'ADMIN' || currentRole === 'WAREHOUSE_MANAGER' || currentRole === 'INVENTORY_CLERK') && (
                            <button
                              onClick={() => handleReceiveOrder(po.id, po.po_number)}
                              className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow transition-all"
                              title="Post Goods Receipt Note (GRN)"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>Receive Goods</span>
                            </button>
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

      {/* MODAL 1: CREATE PURCHASE ORDER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Generate Purchase Order (PO)</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Supplier Partner *</label>
                  <select
                    required
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.payment_terms})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Receiving Destination Warehouse *</label>
                  <select
                    required
                    value={formData.destination_warehouse_id}
                    onChange={(e) => setFormData({ ...formData, destination_warehouse_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Line Items Picker */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                    PO Order Line Items
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-blue-600 hover:underline text-xs font-semibold flex items-center"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Product Row
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.items.map((item, index) => {
                    const lineTotal = Number(item.quantity || 0) * Number(item.unit_cost || 0);

                    return (
                      <div key={index} className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200">
                        <div className="flex-1">
                          <select
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-24">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            placeholder="Qty"
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-center"
                          />
                        </div>

                        <div className="w-28">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_cost}
                            onChange={(e) => handleItemChange(index, 'unit_cost', Number(e.target.value))}
                            placeholder="Cost"
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right font-mono"
                          />
                        </div>

                        <div className="w-24 text-right font-bold text-slate-800">
                          ${lineTotal.toFixed(2)}
                        </div>

                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(index)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Grand Total */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="font-semibold text-slate-600">Total Purchase Commitment:</span>
                  <span className="font-bold text-base text-blue-600 font-mono">
                    ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purchase Order Terms & Notes</label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow"
                >
                  {submitting ? 'Transmitting PO...' : 'Issue Purchase Order'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW PURCHASE ORDER SLIP */}
      {isViewModalOpen && viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{viewOrder.order.po_number}</h3>
                <span className="text-xs text-slate-500">Official Purchase Order & Goods Receipt Record</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                  ✕
                </button>
              </div>
            </div>

            {/* PO Details Grid */}
            <div className="grid grid-cols-2 gap-4 mt-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="text-slate-400 font-bold uppercase text-[10px]">Vendor Supplier</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{viewOrder.order.supplier_name}</div>
                <div className="text-slate-600 mt-1">{viewOrder.order.supplier_contact} • {viewOrder.order.supplier_email}</div>
              </div>

              <div>
                <div className="text-slate-400 font-bold uppercase text-[10px]">Ship-to Facility</div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{viewOrder.order.destination_warehouse_name}</div>
                <div className="text-slate-600 mt-1">{viewOrder.order.destination_warehouse_address}</div>
              </div>
            </div>

            {/* Items */}
            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">Item & SKU</th>
                    <th className="p-2.5 text-center">Qty Ordered</th>
                    <th className="p-2.5 text-center">Qty Received</th>
                    <th className="p-2.5 text-right">Unit Cost</th>
                    <th className="p-2.5 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewOrder.items.map(it => (
                    <tr key={it.id}>
                      <td className="p-2.5 font-semibold text-slate-800">{it.product_name} ({it.sku})</td>
                      <td className="p-2.5 text-center">{it.quantity_ordered}</td>
                      <td className="p-2.5 text-center font-bold text-emerald-600">{it.quantity_received}</td>
                      <td className="p-2.5 text-right">${it.unit_cost.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-bold">${it.line_total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <div className="text-slate-500">
                Created By: <strong className="text-slate-700">{viewOrder.order.created_by}</strong> on {viewOrder.order.order_date}
              </div>
              <div className="text-base font-bold text-slate-900 font-mono">
                Total: ${viewOrder.order.total_amount.toFixed(2)}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
