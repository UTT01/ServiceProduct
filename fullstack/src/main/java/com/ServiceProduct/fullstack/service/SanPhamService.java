package com.ServiceProduct.fullstack.service;

import com.ServiceProduct.fullstack.dto.response.SanPhamResponse;
import com.ServiceProduct.fullstack.entity.CongThuc;
import com.ServiceProduct.fullstack.entity.SanPham;
import com.ServiceProduct.fullstack.repository.SanPhamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SanPhamService {
    private final SanPhamRepository sanPhamRepository;

    public List<SanPhamResponse> getAllSanPham() {
    List<SanPham> danhSach = sanPhamRepository.findAll();

    return danhSach.stream().map(sp -> {
        SanPhamResponse dto = new SanPhamResponse();
        dto.setMaSanPham(sp.getMaSanPham());
        dto.setTenSanPham(sp.getTenSanPham());
        dto.setDonGia(sp.getDonGia());
        dto.setDuongDanHinh(sp.getDuongDanHinh());
        dto.setTrangThai(sp.getTrangThai());
        if (sp.getLoaiSanPham() != null) {
            dto.setMaLoaiSanPham(sp.getLoaiSanPham().getMaLoaiSanPham());
            dto.setTenLoaiSanPham(sp.getLoaiSanPham().getTenLoaiSanPham());
        }
        // Thêm dòng này:
        dto.setDanhSachCongThuc(sp.getDanhSachCongThuc()); 
        return dto;
    }).collect(Collectors.toList());
}

    @Transactional
    public SanPham saveSanPham(SanPham sanPham) {
        
        // THÊM ĐOẠN NÀY VÀO: 
        // Lặp qua danh sách công thức và báo cho Hibernate biết "Công thức này là của Sản phẩm này"
        if (sanPham.getDanhSachCongThuc() != null) {
            for (CongThuc ct : sanPham.getDanhSachCongThuc()) {
                ct.setSanPham(sanPham); 
            }
        }
        
        // Đoạn lưu giữ nguyên
        return sanPhamRepository.save(sanPham);
    }

    @Transactional
    public void deleteSanPham(String maSanPham) {
        sanPhamRepository.deleteById(maSanPham);
    }
}