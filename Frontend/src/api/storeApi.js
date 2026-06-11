import { apiClient } from './httpClient';

export const khoApi = {
    getAll: () => apiClient.get('/api/store/nguyen-lieu'),
    create: (data) => apiClient.post('/api/store/nguyen-lieu', data),
};
