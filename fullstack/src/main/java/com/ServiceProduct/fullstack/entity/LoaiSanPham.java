package com.ServiceProduct.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name = "LoaiSanPham")
@Data @NoArgsConstructor @AllArgsConstructor
public class LoaiSanPham {
    @Id
    @Column(name = "maLoaiSanPham", length = 20)
    private String maLoaiSanPham;

    @Column(name = "tenLoaiSanPham", columnDefinition = "NVARCHAR(100)")
    private String tenLoaiSanPham;

    @Column(name = "duongDanHinh", columnDefinition = "NVARCHAR(MAX)")
    private String duongDanHinh;
    @JsonIgnore
    @OneToMany(mappedBy = "loaiSanPham", cascade = CascadeType.ALL, orphanRemoval = true) // Cập nhật dòng này
    private List<SanPham> danhSachSanPham;
}