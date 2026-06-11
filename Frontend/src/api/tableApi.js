import { apiClient } from './httpClient';

const HIDDEN_TABLE_STATUS = '\u1EA8n';
const isVisibleTable = (table) => String(table?.trangThaiBan || '').trim() !== HIDDEN_TABLE_STATUS;

export const tableApi = {
    getTables: () => apiClient.get('/api/table/ban').then((res) => ({
        ...res,
        data: Array.isArray(res.data) ? res.data.filter(isVisibleTable) : res.data,
    })),
    getTableName: (maBan) => apiClient.get(`/api/table/ban/${maBan}`),
    getBanTrong: (maBan) => apiClient.get(`/api/table/ban/ban-trong/${maBan}`),
    getKhuVuc: () => apiClient.get('/api/table/khuvuc'),
    getBanByKhuVuc: (maKhuVuc) => apiClient.get(`/api/table/ban/khuvuc/${maKhuVuc}`),
    createBan: (data) => apiClient.post('/api/table/ban', data),
    updateBan: (maBan, data) => apiClient.put(`/api/table/ban/${maBan}`, data),
    deleteBan: (maBan) => apiClient.delete(`/api/table/ban/${maBan}`),
    updateTrangThai: (maBan, status = 'Pending') =>
        apiClient.put(`/api/table/ban/updateTrangThai/${maBan}`, null, { params: { status } }),
};

export const khuVucApi = {
    getAll: () => apiClient.get('/api/table/khuvuc'),
    create: (data) => apiClient.post('/api/table/khuvuc', data),
    update: (id, data) => apiClient.put(`/api/table/khuvuc/${id}`, data),
    delete: (id) => apiClient.delete(`/api/table/khuvuc/${id}`),
};
