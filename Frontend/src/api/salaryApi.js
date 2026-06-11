import { apiClient, authHeaders } from './httpClient';

export const salaryApi = {
    getStatus: (maNV, token) => apiClient.get(`/api/salary/cham-cong/status/${maNV}`, authHeaders(token)),
    getActiveDays: (maNV, month, year, token) =>
        apiClient.get('/api/salary/cham-cong/active-days', {
            params: { maNV, month, year },
            ...authHeaders(token),
        }),
    getHistory: (maNV, month, year, token) =>
        apiClient.get('/api/salary/cham-cong/history', {
            params: { maNV, month, year },
            ...authHeaders(token),
        }),
    thucHien: (maNV, token) => apiClient.post('/api/salary/cham-cong/thuc-hien', { maNV }, authHeaders(token)),
    getAll: (month, year, token) =>
        apiClient.get('/api/salary/all', {
            params: { thang: month, nam: year },
            ...authHeaders(token),
        }),
    calculateAll: (month, year, token) =>
        apiClient.post('/api/salary/calculate-all', { thang: month, nam: year }, authHeaders(token)),
    pay: (maNV, month, year, token) =>
        apiClient.put(`/api/salary/pay/${maNV}`, null, {
            params: { thang: month, nam: year },
            ...authHeaders(token),
        }),
    create: (data, token) => apiClient.post('/api/salary/create', data, authHeaders(token)),
    fixCaLoi: (data, token) => apiClient.put('/api/salary/cham-cong/fix-ca-loi', data, authHeaders(token)),
};
