package com.example.servicecafe.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "HoaDon")
public class HoaDon {

    @Id
    @Column(name = "maHoaDon", length = 40)
    private String maHoaDon;

    @Column(name = "maBan", length = 20)
    private String maBan;

    @Column(name = "thoiGianVao")
    private LocalDateTime thoiGianVao;

    @Column(name = "thoiGianRa")
    private LocalDateTime thoiGianRa;

    @Column(name = "phuongThucThanhToan", columnDefinition = "nvarchar(20)")
    private String phuongThucThanhToan;

    @Column(name = "maKhuyenMai", length = 20)
    private String maKhuyenMai;

    @Column(name = "tongTien")
    private double tongTien;

    @Column(name = "trangThaiThanhToan", columnDefinition = "nvarchar(20)")
    private String trangThaiThanhToan;

    @Column(name = "maCa", length = 20)
    private String maCa;

    public List<ChiTietHD> getChiTietHDs() {
        return chiTietHDs;
    }

    public void setChiTietHDs(List<ChiTietHD> chiTietHDs) {
        this.chiTietHDs = chiTietHDs;
    }

    @OneToMany(mappedBy = "maHoaDon", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ChiTietHD> chiTietHDs;
    // --- GETTER VÀ SETTER ---

    public String getMaHoaDon() {
        return maHoaDon;
    }

    public void setMaHoaDon(String maHoaDon) {
        this.maHoaDon = maHoaDon;
    }

    public String getMaBan() {
        return maBan;
    }

    public void setMaBan(String maBan) {
        this.maBan = maBan;
    }

    public LocalDateTime getThoiGianVao() {
        return thoiGianVao;
    }

    public void setThoiGianVao(LocalDateTime thoiGianVao) {
        this.thoiGianVao = thoiGianVao;
    }

    public LocalDateTime getThoiGianRa() {
        return thoiGianRa;
    }

    public void setThoiGianRa(LocalDateTime thoiGianRa) {
        this.thoiGianRa = thoiGianRa;
    }

    public String getPhuongThucThanhToan() {
        return phuongThucThanhToan;
    }

    public void setPhuongThucThanhToan(String phuongThucThanhToan) {
        this.phuongThucThanhToan = phuongThucThanhToan;
    }

    public String getMaKhuyenMai() {
        return maKhuyenMai;
    }

    public void setMaKhuyenMai(String maKhuyenMai) {
        this.maKhuyenMai = maKhuyenMai;
    }

    public double getTongTien() {
        return tongTien;
    }

    public void setTongTien(double tongTien) {
        this.tongTien = tongTien;
    }

    public String getTrangThaiThanhToan() {
        return trangThaiThanhToan;
    }

    public void setTrangThaiThanhToan(String trangThaiThanhToan) {
        this.trangThaiThanhToan = trangThaiThanhToan;
    }

    public String getMaCa() {
        return maCa;
    }

    public void setMaCa(String maCa) {
        this.maCa = maCa;
    }


}
