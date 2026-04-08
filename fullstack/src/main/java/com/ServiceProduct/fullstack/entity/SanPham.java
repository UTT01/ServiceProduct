package com.ServiceProduct.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "SanPham")
@Data @NoArgsConstructor @AllArgsConstructor
public class SanPham {
    @Id
    @Column(name = "maSanPham", length = 20)
    private String maSanPham;

    @Column(name = "tenSanPham", columnDefinition = "NVARCHAR(100)")
    private String tenSanPham;

    @Column(name = "donGia")
    private Double donGia;

    @Column(name = "duongDanHinh", columnDefinition = "NVARCHAR(MAX)")
    private String duongDanHinh;

    @Column(name = "trangThai", columnDefinition = "NVARCHAR(20)")
    private String trangThai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maLoaiSanPham")
    private LoaiSanPham loaiSanPham;

    // Khi xóa Sản phẩm, toàn bộ Công thức của nó cũng tự động bị xóa (cascade = CascadeType.ALL)
    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<CongThuc> danhSachCongThuc;
}