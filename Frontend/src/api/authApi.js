import { apiClient, authHeaders } from './httpClient';

const AUTH_API = '/api/user/auth';

export const authApi = {
    baseURL: () => '/api/user',
    login: (data) => apiClient.post(`${AUTH_API}/login`, data),
    register: (data) => apiClient.post(`${AUTH_API}/register`, data),
    changePassword: (data, token) => apiClient.post(`${AUTH_API}/change-password`, data, authHeaders(token)),
    forgotPassword: (email) => apiClient.post(`${AUTH_API}/forgot`, { email }),
    verifyOTP: (email, otp) => apiClient.post(`${AUTH_API}/verify-otp`, { email, otp: otp.toString() }),
    resetPassword: (email, otp, newPassword) =>
        apiClient.post(`${AUTH_API}/reset`, { email, otp: otp.toString(), newPassword }),
    getProfile: (token) => apiClient.get('/api/user/nhan-vien/me', authHeaders(token)),
};

export const employeeApi = {
    getAll: (token) => apiClient.get('/api/user/nhan-vien', authHeaders(token)),
    create: (data, token) => apiClient.post('/api/user/nhan-vien', data, authHeaders(token)),
    update: (id, data, token) => apiClient.put(`/api/user/nhan-vien/${id}`, data, authHeaders(token)),
    delete: (id, token) => apiClient.delete(`/api/user/nhan-vien/${id}`, authHeaders(token)),
};

export const saveToken = (token) => localStorage.setItem('token', token);

export const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
};
