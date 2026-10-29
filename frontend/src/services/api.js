// API client for Retail Inventory Management System

const API_BASE = '/api';

export const getHeaders = () => {
  const role = localStorage.getItem('retail_user_role') || 'ADMIN';
  const token = localStorage.getItem('retail_jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    'x-user-role': role
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return handleResponse(res);
  },
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/users`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/overview`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ''}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getProductById: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createProduct: async (productData) => {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },
  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    return handleResponse(res);
  },
  deleteProduct: async (id) => {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Warehouses
  getWarehouses: async () => {
    const res = await fetch(`${API_BASE}/warehouses`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getWarehouseById: async (id) => {
    const res = await fetch(`${API_BASE}/warehouses/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createWarehouse: async (whData) => {
    const res = await fetch(`${API_BASE}/warehouses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(whData)
    });
    return handleResponse(res);
  },

  // Inventory
  getInventoryMatrix: async () => {
    const res = await fetch(`${API_BASE}/inventory/matrix`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getLowStockAlerts: async () => {
    const res = await fetch(`${API_BASE}/inventory/low-stock-alerts`, { headers: getHeaders() });
    return handleResponse(res);
  },
  adjustStock: async (adjustData) => {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(adjustData)
    });
    return handleResponse(res);
  },
  updateBinLocation: async (data) => {
    const res = await fetch(`${API_BASE}/inventory/bin-location`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Transfers
  getTransfers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/transfers${query ? `?${query}` : ''}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createTransfer: async (transferData) => {
    const res = await fetch(`${API_BASE}/transfers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(transferData)
    });
    return handleResponse(res);
  },
  dispatchTransfer: async (id) => {
    const res = await fetch(`${API_BASE}/transfers/${id}/dispatch`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  receiveTransfer: async (id) => {
    const res = await fetch(`${API_BASE}/transfers/${id}/receive`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },
  cancelTransfer: async (id) => {
    const res = await fetch(`${API_BASE}/transfers/${id}/cancel`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Suppliers
  getSuppliers: async () => {
    const res = await fetch(`${API_BASE}/suppliers`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createSupplier: async (data) => {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Purchase Orders
  getPurchaseOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/purchase-orders${query ? `?${query}` : ''}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getPurchaseOrderById: async (id) => {
    const res = await fetch(`${API_BASE}/purchase-orders/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createPurchaseOrder: async (data) => {
    const res = await fetch(`${API_BASE}/purchase-orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  receivePurchaseOrder: async (id) => {
    const res = await fetch(`${API_BASE}/purchase-orders/${id}/receive`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Sales Orders
  getSalesOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/sales-orders${query ? `?${query}` : ''}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getSalesOrderById: async (id) => {
    const res = await fetch(`${API_BASE}/sales-orders/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  createSalesOrder: async (data) => {
    const res = await fetch(`${API_BASE}/sales-orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  updateSalesOrderStatus: async (id, statusData) => {
    const res = await fetch(`${API_BASE}/sales-orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(statusData)
    });
    return handleResponse(res);
  },

  // Agile
  getAgileOverview: async () => {
    const res = await fetch(`${API_BASE}/agile/overview`, { headers: getHeaders() });
    return handleResponse(res);
  },
  getAgileStories: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/agile/stories${query ? `?${query}` : ''}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  updateStoryStatus: async (id, status) => {
    const res = await fetch(`${API_BASE}/agile/stories/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  }
};
