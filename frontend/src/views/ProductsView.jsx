import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Barcode, 
  Warehouse, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function ProductsView({ currentRole, onReorder }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('ALL'); // ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    barcode: '',
    unit_price: '',
    cost_price: '',
    reorder_point: 20,
    reorder_quantity: 50,
    unit_of_measure: 'Units',
    image_url: '',
    initial_allocations: {}
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, whRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getWarehouses()
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
      setWarehouses(whRes.warehouses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateRandomSku = () => {
    const prefix = selectedCategory ? (categories.find(c => c.id === selectedCategory)?.name.substring(0, 4).toUpperCase() || 'PROD') : 'PROD';
    const rand = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({
      ...prev,
      sku: `${prefix}-${rand}`,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`
    }));
  };

  const handleOpenAdd = () => {
    const initialAlloc = {};
    warehouses.forEach(w => { initialAlloc[w.id] = 10; });

    setFormData({
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      description: '',
      category_id: categories[0]?.id || '',
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      unit_price: '',
      cost_price: '',
      reorder_point: 20,
      reorder_quantity: 50,
      unit_of_measure: 'Units',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
      initial_allocations: initialAlloc
    });
    setIsAddModalOpen(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createProduct(formData);
      setIsAddModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = async (prod) => {
    try {
      const res = await api.getProductById(prod.id);
      setDetailProduct(res);
      setDetailModalOpen(true);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.deleteProduct(id);
        await loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search);
    
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;

    let matchesStock = true;
    if (stockStatus === 'IN_STOCK') {
      matchesStock = p.total_quantity > p.reorder_point;
    } else if (stockStatus === 'LOW_STOCK') {
      matchesStock = p.total_quantity > 0 && p.total_quantity <= p.reorder_point;
    } else if (stockStatus === 'OUT_OF_STOCK') {
      matchesStock = p.total_quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog & SKU Master</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central repository of retail SKUs, pricing margins, barcoding, and safety stock points
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all shadow-sm"
            title="Refresh Catalog"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {(currentRole === 'ADMIN' || currentRole === 'WAREHOUSE_MANAGER') && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Name, SKU, or Barcode..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Stock Status Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStockStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all ${stockStatus === 'ALL' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All
            </button>
            <button
              onClick={() => setStockStatus('IN_STOCK')}
              className={`px-2.5 py-1 rounded-lg transition-all ${stockStatus === 'IN_STOCK' ? 'bg-white text-emerald-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockStatus('LOW_STOCK')}
              className={`px-2.5 py-1 rounded-lg transition-all ${stockStatus === 'LOW_STOCK' ? 'bg-white text-amber-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setStockStatus('OUT_OF_STOCK')}
              className={`px-2.5 py-1 rounded-lg transition-all ${stockStatus === 'OUT_OF_STOCK' ? 'bg-white text-rose-700 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Out of Stock
            </button>
          </div>

        </div>

      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Product & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Cost (Margin)</th>
                <th className="py-3 px-4 text-center">Total Stock</th>
                <th className="py-3 px-4 text-center">Safety Reorder</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Loading products catalog...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const marginPercent = p.unit_price > 0 
                    ? Math.round(((p.unit_price - p.cost_price) / p.unit_price) * 100) 
                    : 0;

                  const isOut = p.total_quantity === 0;
                  const isLow = !isOut && p.total_quantity <= p.reorder_point;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&q=80'}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {p.name}
                            </div>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono mt-0.5">
                              <span className="font-bold text-slate-600">{p.sku}</span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Barcode className="w-3 h-3 mr-1 text-slate-400" />
                                {p.barcode}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {p.category_name || 'General'}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ${p.unit_price.toFixed(2)}
                      </td>

                      {/* Cost & Margin */}
                      <td className="py-3 px-4 text-right">
                        <div className="text-slate-600">${p.cost_price.toFixed(2)}</div>
                        <div className="text-[10px] text-emerald-600 font-semibold font-mono">
                          {marginPercent}% margin
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-900 text-sm">
                          {p.total_quantity}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {p.available_quantity} avail • {p.total_reserved} res
                        </div>
                      </td>

                      {/* Safety Reorder Point */}
                      <td className="py-3 px-4 text-center font-mono text-slate-600">
                        {p.reorder_point} {p.unit_of_measure}
                      </td>

                      {/* Health Status */}
                      <td className="py-3 px-4 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 mr-1" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Optimal
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenDetail(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Warehouse Stock Breakdown"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {currentRole === 'ADMIN' && (
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* MODAL 1: ADD NEW PRODUCT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900">Add New Product to Catalog</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-4 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* SKU */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Product SKU *</label>
                    <button
                      type="button"
                      onClick={generateRandomSku}
                      className="text-[11px] text-blue-600 hover:underline flex items-center font-medium"
                    >
                      <Sparkles className="w-3 h-3 mr-0.5" /> Auto SKU
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold"
                    placeholder="ELEC-LAPTOP-01"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. Ergonomic Office Wireless Mouse"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    placeholder="890123450999"
                  />
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Retail Selling Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    placeholder="199.99"
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    placeholder="110.00"
                  />
                </div>

                {/* Reorder Point */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Reorder Point *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.reorder_point}
                    onChange={(e) => setFormData({ ...formData, reorder_point: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {/* Unit of Measure */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={formData.unit_of_measure}
                    onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="Units / Pairs / Boxes"
                  />
                </div>

              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specifications & Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  placeholder="Key features, specs, and materials..."
                />
              </div>

              {/* Initial Warehouse Allocation */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-xs font-bold text-slate-800 mb-2">
                  Initial Stock Allocation across 4 Warehouses:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {warehouses.map(w => (
                    <div key={w.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold text-slate-700 truncate">{w.code}</div>
                      <div className="text-[10px] text-slate-400 mb-1">{w.location}</div>
                      <input
                        type="number"
                        min="0"
                        value={formData.initial_allocations[w.id] || 0}
                        onChange={(e) => setFormData({
                          ...formData,
                          initial_allocations: {
                            ...formData.initial_allocations,
                            [w.id]: Number(e.target.value)
                          }
                        })}
                        className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all flex items-center space-x-1"
                >
                  {submitting ? 'Saving...' : 'Create Product Master'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRODUCT DETAIL & WAREHOUSE BREAKDOWN */}
      {detailModalOpen && detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img
                  src={detailProduct.product.image_url}
                  alt={detailProduct.product.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900">{detailProduct.product.name}</h3>
                  <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mt-0.5">
                    <span>SKU: {detailProduct.product.sku}</span>
                    <span>•</span>
                    <span>Barcode: {detailProduct.product.barcode}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Description & Pricing summary */}
            <div className="mt-4 grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Category</span>
                <div className="font-semibold text-slate-800">{detailProduct.product.category_name}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Selling Price</span>
                <div className="font-semibold text-slate-800">${detailProduct.product.unit_price.toFixed(2)}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Supplier Cost</span>
                <div className="font-semibold text-emerald-600">${detailProduct.product.cost_price.toFixed(2)}</div>
              </div>
            </div>

            {/* Warehouse Breakdown */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
                <Warehouse className="w-4 h-4 mr-1.5 text-blue-600" />
                Physical Stock Distribution Across 4 Regional Hubs
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {detailProduct.warehouseInventory.map((item) => {
                  const isLow = item.quantity <= 10;
                  return (
                    <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center space-x-2">
                          <span>{item.warehouse_name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                            {item.warehouse_code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Bin Coordinate: <strong className="font-mono text-slate-700">{item.bin_location || 'AISLE-01'}</strong> • Location: {item.warehouse_location}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {item.quantity} units
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.quantity - item.reserved_quantity} available • {item.reserved_quantity} reserved
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
