import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ (1) Handle response errors gracefully (added console + optional redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message); // helpful for debugging
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Faculty APIs
export const facultyAPI = {
  getAll: () => api.get('/faculty'),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
  getSubjects: (id) => api.get(`/faculty/${id}/subjects`),
  assignSubject: (facultyId, subjectId, preferenceLevel) =>
    api.post(`/faculty/${facultyId}/subjects/${subjectId}`, { preference_level: preferenceLevel }),
};

// Subject APIs
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Classroom APIs
export const classroomAPI = {
  getAll: () => api.get('/classrooms'),
  getById: (id) => api.get(`/classrooms/${id}`),
  create: (data) => api.post('/classrooms', data),
  update: (id, data) => api.put(`/classrooms/${id}`, data),
  delete: (id) => api.delete(`/classrooms/${id}`),
};

// Batch APIs
export const batchAPI = {
  getAll: () => api.get('/batches'),
  getById: (id) => api.get(`/batches/${id}`),
  create: (data) => api.post('/batches', data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
  getSubjects: (id) => api.get(`/batches/${id}/subjects`),
  assignSubject: (batchId, subjectId, hoursPerWeek) =>
    api.post(`/batches/${batchId}/subjects/${subjectId}`, { hours_per_week: hoursPerWeek }),
};

// Time Slot APIs
export const timeSlotAPI = {
  getAll: () => api.get('/time-slots'),
  getAvailable: () => api.get('/time-slots/available'),
  getById: (id) => api.get(`/time-slots/${id}`),
  create: (data) => api.post('/time-slots', data),
  update: (id, data) => api.put(`/time-slots/${id}`, data),
  delete: (id) => api.delete(`/time-slots/${id}`),
};

// Timetable APIs
export const timetableAPI = {
  getAll: (params) => api.get('/timetable', { params }),
  getById: (id) => api.get(`/timetable/${id}`),
  create: (data) => api.post('/timetable', data),
  update: (id, data) => api.put(`/timetable/${id}`, data),
  delete: (id) => api.delete(`/timetable/${id}`),

  // ✅ (2) Added missing endpoint to view existing timetable by batch
  getByBatch: (batchId) => api.get(`/timetable/batch/${batchId}`),
};

// Auto-Schedule APIs
export const autoScheduleAPI = {
  generate: (batchId, data) => api.post(`/auto-schedule/generate/${batchId}`, data),
  generateMultiple: (batchId, data) => api.post(`/auto-schedule/generate-multiple/${batchId}`, data),
  preview: (batchId) => api.get(`/auto-schedule/preview/${batchId}`),
  analyze: (batchId) => api.get(`/auto-schedule/analyze/${batchId}`),
  optimize: (batchId, data) => api.post(`/auto-schedule/optimize/${batchId}`, data),
  getSuggestions: (batchId) => api.get(`/auto-schedule/suggestions/${batchId}`),

  // ✅ (3) Added endpoint for progress/status tracking (optional)
  getStatus: (batchId) => api.get(`/auto-schedule/status/${batchId}`),
};

// Reports APIs
export const reportsAPI = {
  getSummary: () => api.get('/summary'),
  getFacultyWorkload: () => api.get('/reports/faculty-workload'),
  getClassroomUtilization: () => api.get('/reports/classroom-utilization'),
  getTimetableCompleteness: () => api.get('/reports/timetable-completeness'),
};

// Constraints APIs
export const constraintsAPI = {
  getAll: () => api.get('/constraints'),
  getById: (id) => api.get(`/constraints/${id}`),
  create: (data) => api.post('/constraints', data),
  update: (id, data) => api.put(`/constraints/${id}`, data),
  delete: (id) => api.delete(`/constraints/${id}`),
};

// Faculty Leave APIs
export const facultyLeaveAPI = {
  getAll: () => api.get('/faculty-leaves'),
  getById: (id) => api.get(`/faculty-leaves/${id}`),
  create: (data) => api.post('/faculty-leaves', data),
  update: (id, data) => api.put(`/faculty-leaves/${id}`, data),
  delete: (id) => api.delete(`/faculty-leaves/${id}`),
  approve: (id) => api.patch(`/faculty-leaves/${id}/approve`),
  reject: (id) => api.patch(`/faculty-leaves/${id}/reject`),
};

export default api;
