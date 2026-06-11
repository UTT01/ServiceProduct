import { apiClient } from './httpClient';

export const chiTietHDApi = {
    getByHoaDon: (maHoaDon) => apiClient.get(`/api/cafe/chitiethd/hoadon/${maHoaDon}`),
};

export const orderApi = {
    getProducts: () => apiClient.get('/api/product/v1/san-pham'),
    removeOrderItem: (maChiTietHD) => apiClient.delete(`/api/cafe/orders/remove-item/${maChiTietHD}`),
    loadBan: (maBan) => apiClient.get(`/api/cafe/orders/loadBan/${maBan}`),
    staffCreate: (orderData) => apiClient.post('/api/cafe/orders/staff-create', orderData),
    finalPayment: (paymentPayload) => apiClient.post('/api/cafe/payments/final-payment', paymentPayload),
};

export const hoaDonApi = {
    getAll: () => apiClient.get('/api/cafe/hoadon'),
    getByCa: (maCa) => apiClient.get(`/api/cafe/hoadon/ca/${maCa}`),
};
