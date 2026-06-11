import { apiClient, authHeaders } from './httpClient';

export const notificationApi = {
    getAllNoti: () => apiClient.get('/api/notification/notifications'),
    getByEmployee: (maNV) => apiClient.get(`/api/notification/notifications/list/${maNV}`),
    create: (data, token) => apiClient.post('/api/notification/notifications/create', data, authHeaders(token)),
    getUnreadCount: (maNV) => apiClient.get(`/api/notification/notifications/unread-count/${maNV}`),
    markAsRead: (id) => apiClient.put(`/api/notification/notifications/read/${id}`),
};
