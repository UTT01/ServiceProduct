import { apiClient } from './httpClient';

export const productApi = {
    getProducts: () => apiClient.get('/api/product/v1/san-pham'),
    getLoaiSP: () => apiClient.get('/api/product/v1/loai-san-pham'),
    create: (data) => apiClient.post('/api/product/v1/san-pham', data),
    upload: (formData) => apiClient.post('/api/product/v1/upload', formData),
};

export const loaiSanPhamApi = {
    getAll: () => apiClient.get('/api/product/v1/loai-san-pham'),
    create: (data) => apiClient.post('/api/product/v1/loai-san-pham', data),
    update: (id, data) => apiClient.put(`/api/product/v1/loai-san-pham/${id}`, data),
    delete: (id) => apiClient.delete(`/api/product/v1/loai-san-pham/${id}`),
};
