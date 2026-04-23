import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — kick back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/update-profile', data),
  changePassword: (data) => api.put('/api/auth/change-password', data),
};

// ── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  my: (month) => api.get('/attendance/my', { params: { month } }),
  today: () => api.get('/attendance/today'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAttendance: (params) => api.get('/admin/attendance', { params }),
  updateAttendance: (id, data) => api.put(`/admin/attendance/${id}`, data),
  bulkMark: (data) => api.post('/admin/attendance/bulk-mark', data),
  exportCSV: (month) => api.get('/admin/export/csv', { params: { month }, responseType: 'blob' }),
};

// ── QR ────────────────────────────────────────────────────────────────────────
export const qrAPI = {
  generate: (data) => api.post('/qr/generate', data),
  scan: (token) => api.post(`/qr/scan/${token}`),
  sessions: () => api.get('/qr/sessions'),
};

export default api;
