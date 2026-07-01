package com.example.serviceproduct.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.example.serviceproduct.entity.keys.CongThucId;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CongThuc")
@Data @NoArgsConstructor @AllArgsConstructor
public class CongThuc {
    @EmbeddedId
    private CongThucId id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maSanPham")
    @JoinColumn(name = "maSanPham")
    private SanPham sanPham;


    @Column(name = "soLuong")
    private Double soLuong;

    public String getMaSanPham() {
        return id != null ? id.getMaSanPham() : null;
    }

    public String getMaNguyenLieu() {
        return id != null ? id.getMaNguyenLieu() : null;
    }
}
