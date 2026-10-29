import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Star, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Plus, 
  FileText, 
  CheckCircle2, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';

export default function SuppliersView({ currentRole, onSelectSupplier }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: '',
    lead_time_days: 7,
    rating: 4.8,
    payment_terms: 'Net 30'
  });

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.getSuppliers();
      setSuppliers(res.suppliers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createSupplier(formData);
      setIsAddModalOpen(false);
      await loadSuppliers();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Supplier Directory & Vendor Scorecards</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement partner master data, contractual payment terms, lead-time metrics, and quality ratings
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadSuppliers}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {(currentRole === 'ADMIN' || currentRole === 'PROCUREMENT_MANAGER') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Register Vendor</span>
            </button>
          )}
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                      <span className="font-bold text-slate-600">{s.code}</span>
                      <span>•</span>
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                        {s.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {s.payment_terms}
                </span>
              </div>

              {/* Details */}
              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400">Account Rep:</span>
                  <span className="font-semibold text-slate-800">{s.contact_name}</span>
                </div>
                <div className="flex items-center space-x-4 pt-1">
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.email}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 text-[11px] pt-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{s.address}</span>
                </div>
              </div>

              {/* Scorecard Strip */}
              <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Avg Delivery Lead Time</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-blue-500 mr-1" />
                    {s.lead_time_days} Business Days
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Active Purchase Orders</div>
                  <div className="text-sm font-bold text-indigo-600 mt-0.5 flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                    {s.active_orders_count || 0} Open
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD SUPPLIER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">Register Supply Chain Partner</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Pacific Component Logistics Corp"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Representative *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="e.g. Thomas Vance"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="orders@partner.com"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (800) 555-0100"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <select
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                    <option value="Net 60">Net 60 Days</option>
                    <option value="COD">Cash on Delivery (COD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Avg Lead Time (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.lead_time_days}
                    onChange={(e) => setFormData({ ...formData, lead_time_days: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quality Rating (1 to 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Headquarters Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="1200 Pacific Way, Suite 400, Seattle, WA"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow"
                >
                  {submitting ? 'Registering...' : 'Register Vendor'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
