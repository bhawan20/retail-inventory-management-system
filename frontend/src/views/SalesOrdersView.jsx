import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Truck, 
  PackageCheck, 
  Eye, 
  Printer, 
  RefreshCw, 
  Warehouse, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';

export default function SalesOrdersView({ currentRole }) {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Sales Order Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_address: '',
    fulfillment_warehouse_id: '',
    items: [{ product_id: '', quantity: 1, unit_price: 0 }]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [soRes, whRes, prodRes] = await Promise.all([
        api.getSalesOrders(),
        api.getWarehouses(),
        api.getProducts()
      ]);
      setOrders(soRes.orders || []);
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

  const handleOpenCreate = () => {
    const firstProd = products[0];
    setFormData({
      customer_name: '',
      customer_email: '',
      customer_address: '',
      fulfillment_warehouse_id: warehouses[0]?.id || '',
      items: [
        { product_id: firstProd?.id || '', quantity: 1, unit_price: firstProd?.unit_price || 0 }
      ]
    });
    setIsCreateModalOpen(true);
  };

  const handleAddItemRow = () => {
    const firstProd = products[0];
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: firstProd?.id || '', quantity: 1, unit_price: firstProd?.unit_price || 0 }]
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'product_id') {
      const prod = products.find(p => p.id === value);
      newItems[index] = {
        ...newItems[index],
        product_id: value,
        unit_price: prod ? prod.unit_price : 0
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
    return formData.items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createSalesOrder(formData);
      setIsCreateModalOpen(false);
      alert('Sales Order created! Inventory reserved at fulfillment warehouse.');
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, carrier = null) => {
    try {
      await api.updateSalesOrderStatus(orderId, {
        status: newStatus,
        carrier: carrier || 'FedEx Express'
      });
      await loadData();
      if (isViewModalOpen && viewOrder?.order.id === orderId) {
        const refreshed = await api.getSalesOrderById(orderId);
        setViewOrder(refreshed);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleViewOrder = async (id) => {
    try {
      const res = await api.getSalesOrderById(id);
      setViewOrder(res);
      setIsViewModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Fulfillment & Pick-Pack-Ship</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer order processing pipeline with automated warehouse stock reservation and dispatch deduction
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {(currentRole === 'ADMIN' || currentRole === 'SALES_REP') && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Customer Order</span>
            </button>
          )}
        </div>
      </div>

      {/* Fulfillment Pipeline Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['ALL', 'PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED'].map((st) => {
          const count = st === 'ALL' ? orders.length : orders.filter(o => o.status === st).length;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{st === 'ALL' ? 'All Orders' : st}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                statusFilter === st ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Fulfillment Hub</th>
                <th className="py-3 px-4 text-center">Items</th>
                <th className="py-3 px-4 text-right">Order Value</th>
                <th className="py-3 px-4 text-center">Fulfillment Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No sales orders in this fulfillment stage.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Order Number */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{so.order_number}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(so.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{so.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{so.customer_email || 'Retail Store Client'}</div>
                    </td>

                    {/* Fulfillment Hub */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5 font-medium text-slate-700">
                        <Warehouse className="w-3.5 h-3.5 text-blue-500" />
                        <span>{so.fulfillment_warehouse_code}</span>
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4 text-center font-bold text-slate-900">
                      {so.total_units_ordered} units
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      ${so.total_amount.toFixed(2)}
                    </td>

                    {/* Stage */}
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        so.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : so.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : so.status === 'PACKED'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : so.status === 'PICKING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {so.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewOrder(so.id)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Fulfillment Slip & Stepper"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Quick Status Advancement */}
                        {so.status === 'PENDING' && (
                          <button
                            onClick={() => handleUpdateStatus(so.id, 'PICKING')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold"
                          >
                            Start Pick
                          </button>
                        )}
                        {so.status === 'PICKING' && (
                          <button
                            onClick={() => handleUpdateStatus(so.id, 'PACKED')}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Mark Packed
                          </button>
                        )}
                        {so.status === 'PACKED' && (
                          <button
                            onClick={() => handleUpdateStatus(so.id, 'SHIPPED')}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow"
                          >
                            Ship Order
                          </button>
                        )}
                        {so.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleUpdateStatus(so.id, 'DELIVERED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                          >
                            Delivered
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREATE CUSTOMER ORDER */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">New Retail Customer Order</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="e.g. Apex Corporate Supplies"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    placeholder="orders@customer.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fulfillment Dispatch Warehouse *</label>
                  <select
                    required
                    value={formData.fulfillment_warehouse_id}
                    onChange={(e) => setFormData({ ...formData, fulfillment_warehouse_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shipping Destination Address</label>
                  <input
                    type="text"
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    placeholder="Street, City, State, ZIP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Items */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                    Order Line Items
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
                    const lineTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);

                    return (
                      <div key={index} className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-slate-200">
                        <div className="flex-1">
                          <select
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (${p.unit_price.toFixed(2)})</option>
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

                        <div className="w-28 text-right font-bold text-slate-800">
                          ${lineTotal.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="font-semibold text-slate-600">Total Order Amount:</span>
                  <span className="font-bold text-base text-blue-600 font-mono">
                    ${calculateTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
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
                  {submitting ? 'Reserving Stock...' : 'Submit & Reserve Stock'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULFILLMENT STEPPER & PACKING SLIP */}
      {isViewModalOpen && viewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{viewOrder.order.order_number}</h3>
                <span className="text-xs text-slate-500">Pick-Pack-Ship Fulfillment Tracking & Packing Slip</span>
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

            {/* Stepper Bar */}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Order Lifecycle Progression
              </div>
              <div className="flex items-center justify-between relative">
                {['PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED'].map((stage, idx) => {
                  const stages = ['PENDING', 'PICKING', 'PACKED', 'SHIPPED', 'DELIVERED'];
                  const currIdx = stages.indexOf(viewOrder.order.status);
                  const isDone = currIdx >= idx;
                  const isCurrent = currIdx === idx;

                  return (
                    <div key={stage} className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isDone
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold mt-1 ${isCurrent ? 'text-blue-600' : 'text-slate-500'}`}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Advance action button */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Current Status: <strong className="text-slate-900">{viewOrder.order.status}</strong>
                </span>

                <div className="space-x-2">
                  {viewOrder.order.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(viewOrder.order.id, 'PICKING')}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold"
                    >
                      Begin Picking
                    </button>
                  )}
                  {viewOrder.order.status === 'PICKING' && (
                    <button
                      onClick={() => handleUpdateStatus(viewOrder.order.id, 'PACKED')}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                    >
                      Confirm Packed
                    </button>
                  )}
                  {viewOrder.order.status === 'PACKED' && (
                    <button
                      onClick={() => handleUpdateStatus(viewOrder.order.id, 'SHIPPED')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
                    >
                      Dispatch & Ship
                    </button>
                  )}
                  {viewOrder.order.status === 'SHIPPED' && (
                    <button
                      onClick={() => handleUpdateStatus(viewOrder.order.id, 'DELIVERED')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                    >
                      Confirm Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Warehouse Pick Bin Location Guidance */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Order Items & Pick Bin Locations ({viewOrder.order.fulfillment_warehouse_name})
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5">Bin Coordinate</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewOrder.items.map(it => (
                      <tr key={it.id}>
                        <td className="p-2.5 font-semibold text-slate-900">{it.product_name} ({it.sku})</td>
                        <td className="p-2.5 font-mono font-bold text-blue-600">{it.bin_location}</td>
                        <td className="p-2.5 text-center font-bold">{it.quantity}</td>
                        <td className="p-2.5 text-right">${it.unit_price.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-bold">${it.line_total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {viewOrder.order.tracking_number && (
              <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">Carrier: {viewOrder.order.carrier}</span>
                  <div className="font-mono text-[11px] text-blue-700 mt-0.5">Tracking: {viewOrder.order.tracking_number}</div>
                </div>
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
