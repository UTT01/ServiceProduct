package com.ServiceProduct.fullstack.dto.response;

import com.ServiceProduct.fullstack.entity.CongThuc;

import lombok.Data;
import java.util.List; 
@Data
public class SanPhamResponse {
    private String maSanPham;
    private String tenSanPham;
    private Double donGia;
    private String duongDanHinh;
    private String trangThai;
    private String maLoaiSanPham;
    private String tenLoaiSanPham;
    private List<CongThuc> danhSachCongThuc;
}