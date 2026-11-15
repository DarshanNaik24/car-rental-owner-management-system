import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    // Return the response data directly
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.data ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const vehicleApi = {
  getAll: (search, status) => api.get('/vehicles', { params: { search, status } }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  updateStatus: (id, status) => api.patch(`/vehicles/${id}/status`, null, { params: { status } }),
  uploadImage: (formData) => api.post('/vehicles/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const customerApi = {
  getAll: (search) => api.get('/customers', { params: { search } }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const rentalApi = {
  search: (params) => api.get('/rentals', { params }),
  getById: (id) => api.get(`/rentals/${id}`),
  create: (data) => api.post('/rentals', data),
  complete: (id, data) => api.post(`/rentals/${id}/complete`, data),
  cancel: (id, reason) => api.post(`/rentals/${id}/cancel`, null, { params: { reason } }),
  getByVehicle: (vehicleId) => api.get(`/rentals/vehicle/${vehicleId}`),
  getByCustomer: (customerId) => api.get(`/rentals/customer/${customerId}`),
  delete: (id) => api.delete(`/rentals/${id}`),
};

export const inspectionApi = {
  getChecklistItems: () => api.get('/inspections/checklist-items'),
  createChecklistItem: (data) => api.post('/inspections/checklist-items', data),
  deleteChecklistItem: (id) => api.delete(`/inspections/checklist-items/${id}`),
  save: (data) => api.post('/inspections', data),
  getById: (id) => api.get(`/inspections/${id}`),
  getByRental: (rentalId) => api.get(`/inspections/rental/${rentalId}`),
  getByVehicle: (vehicleId) => api.get(`/inspections/vehicle/${vehicleId}`),
  compare: (rentalId) => api.get(`/inspections/compare/${rentalId}`),
  uploadPhoto: (formData) => api.post('/inspections/upload-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const paymentApi = {
  record: (data) => api.post('/payments', data),
  getByRental: (rentalId) => api.get(`/payments/rental/${rentalId}`),
  search: (params) => api.get('/payments', { params }),
  getSummary: () => api.get('/payments/summary'),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const dashboardApi = {
  getOverallStats: () => api.get('/dashboard/overall'),
  getCarStats: (vehicleId) => api.get(`/dashboard/car/${vehicleId}`),
};

export const reportApi = {
  getReports: (params) => api.get('/reports', { params }),
};

export const photoApi = {
  upload: (formData) => api.post('/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByRental: (rentalId) => api.get(`/photos/rental/${rentalId}`),
  getByVehicle: (vehicleId) => api.get(`/photos/vehicle/${vehicleId}`),
  delete: (id) => api.delete(`/photos/${id}`),
};

export default api;
