package com.ServiceProduct.fullstack.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ServiceProduct.fullstack.entity.keys.CongThucId;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("maNguyenLieu")
    @JoinColumn(name = "maNguyenLieu")
    private NguyenLieu nguyenLieu;

    @Column(name = "soLuong")
    private Double soLuong;
}