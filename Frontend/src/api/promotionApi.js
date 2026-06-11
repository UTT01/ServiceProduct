import { apiClient } from './httpClient';

export const promoApi = {
    getActivePromos: () => apiClient.get('/api/promotion/promotions/active'),
    getAllPromos: () => apiClient.get('/api/promotion/promotions'),
    createPromo: (payload) => apiClient.post('/api/promotion/promotions', payload),
    updatePromo: (id, payload) => apiClient.put(`/api/promotion/promotions/${id}`, payload),
    deletePromo: (id) => apiClient.delete(`/api/promotion/promotions/${id}`),
    updateStatus: (id) => apiClient.patch(`/api/promotion/promotions/${id}/status`),
    getConfigsByPromo: (maKM) => apiClient.get(`/api/promotion/promotion-configs/promo/${maKM}`),
};
