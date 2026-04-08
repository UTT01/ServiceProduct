package com.ServiceProduct.fullstack.dto.response;

import lombok.Data;

@Data
public class SanPhamResponse {
    private String maSanPham;
    private String tenSanPham;
    private Double donGia;
    private String duongDanHinh;
    private String trangThai;
    private String maLoaiSanPham;
    private String tenLoaiSanPham;
}