import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('agrimart_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('agrimart_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Products
export const getProducts = (params) => api.get('/api/products', { params });
export const getFeaturedProducts = () => api.get('/api/products/featured');
export const getProduct = (id) => api.get(`/api/products/${id}`);
export const createProduct = (data) => api.post('/api/products', data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`);

// Orders
export const getOrders = (params) => api.get('/api/orders', { params });
export const getOrder = (id) => api.get(`/api/orders/${id}`);
export const createOrder = (data) => api.post('/api/orders', data);
export const updateOrderStatus = (id, data) => api.put(`/api/orders/${id}/status`, data);
export const getDashboardStats = () => api.get('/api/orders/stats/dashboard');

// Users
export const getFarmers = (params) => api.get('/api/users/farmers', { params });
export const getUser = (id) => api.get(`/api/users/${id}`);

// Reviews
export const getProductReviews = (productId) => api.get(`/api/reviews/product/${productId}`);
export const getUserReviews = (userId) => api.get(`/api/reviews/user/${userId}`);
export const createReview = (data) => api.post('/api/reviews', data);

// Notifications
export const getNotifications = () => api.get('/api/notifications');
export const markAllRead = () => api.put('/api/notifications/read-all');

// Auth
export const updateProfile = (data) => api.put('/api/auth/update-profile', data);
export const changePassword = (data) => api.put('/api/auth/change-password', data);

export default api;
