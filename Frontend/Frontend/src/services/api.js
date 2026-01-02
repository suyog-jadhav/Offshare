import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add shop_id
api.interceptors.request.use(
    (config) => {
        const shopId = localStorage.getItem('shop_id');
        if (shopId) {
            config.headers['shop_id'] = shopId;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || 'An error occurred';
        console.error('API Error:', message);
        return Promise.reject(error);
    }
);

// Dashboard Services
export const dashboardService = {
    getStats: () => api.get('/dashboard/stats'),
    getActiveSessions: () => api.get('/dashboard/sessions/active'),
    getTodayJobs: () => api.get('/dashboard/jobs/today'),
    getTodayRevenue: () => api.get('/dashboard/revenue/today'),
    getRevenueByRange: (params) => api.get('/dashboard/revenue/range', { params }),
    getJobStats: () => api.get('/dashboard/jobs/stats'),
    getRecentActivity: (limit = 10) => api.get('/dashboard/recent-activity', { params: { limit } })
};

// Shop Services
export const shopService = {
    create: (data) => api.post('/shop', data),
    get: () => api.get('/shop'),
    update: (data) => api.put('/shop', data)
};

// Customer Services
export const customerService = {
    getAll: (params) => api.get('/customer', { params }),
    getById: (id) => api.get(`/customer/${id}`),
    create: (data) => api.post('/customer/create', data),
    update: (id, data) => api.put(`/customer/${id}`, data),
    delete: (id) => api.delete(`/customer/${id}`),
    getStats: () => api.get('/customer/stats')
};

// Print Job Services
export const printService = {
    getAllJobs: (params) => api.get('/print/jobs', { params }),
    getJobsBySession: (sessionId) => api.get(`/print/jobs/session/${sessionId}`),
    createJobs: (data) => api.post('/print/jobs/create', data),
    printJob: (id) => api.put(`/print/jobs/${id}/print`),
    cancelJob: (id) => api.put(`/print/jobs/${id}/cancel`),
    failJob: (id) => api.put(`/print/jobs/${id}/fail`)
};

// Pricing Services
export const pricingService = {
    getAll: () => api.get('/pricing'),
    lookup: (params) => api.get('/pricing/lookup', { params }),
    create: (data) => api.post('/pricing', data),
    update: (id, data) => api.put(`/pricing/${id}`, data),
    delete: (id) => api.delete(`/pricing/${id}`)
};

// Session Services
export const sessionService = {
    getAll: (params) => api.get('/session', { params }),
    start: (data) => api.post('/session/start', data),
    end: (data) => api.post('/session/end', data),
    heartbeat: (data) => api.post('/session/heartbeat', data)
};

// System Services
export const systemService = {
    health: () => api.get('/system/health'),
    cleanup: () => api.post('/system/cleanup'),
    getActiveSessions: () => api.get('/system/sessions/active'),
    getLogs: () => api.get('/system/logs'),
    getStorage: () => api.get('/system/storage'),
    forceEndSession: (data) => api.post('/system/session/force-end', data)
};

export default api;
