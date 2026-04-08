package com.ServiceProduct.fullstack.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name = "NguyenLieu")
@Data @NoArgsConstructor @AllArgsConstructor
public class NguyenLieu {
    @Id
    @Column(name = "maNguyenLieu", length = 20)
    private String maNguyenLieu;

    @Column(name = "tenNguyenLieu", columnDefinition = "NVARCHAR(100)")
    private String tenNguyenLieu;

    @Column(name = "soLuong")
    private Double soLuong;

    @Column(name = "donViTinh", columnDefinition = "NVARCHAR(20)")
    private String donViTinh;
    @JsonIgnore
    @OneToMany(mappedBy = "nguyenLieu")
    private List<CongThuc> danhSachCongThuc;
}