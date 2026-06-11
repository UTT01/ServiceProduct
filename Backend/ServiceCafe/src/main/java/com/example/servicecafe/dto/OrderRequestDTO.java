package com.example.servicecafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
public class OrderRequestDTO {
    private String maHoaDon;
    private String maBan;
    private List<ItemRequest> items;
    private String maCa;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemRequest {
        private String maChiTietHD;
        private String maSanPham;
        private String tenSanPham;
        private Integer soLuong;
        private Double giaBan;
        private String ghiChu;
    }

    public String getMaBan() {
        return maBan;
    }

    public String getMaHoaDon() {
        return maHoaDon;
    }

    public void setMaHoaDon(String maHoaDon) {
        this.maHoaDon = maHoaDon;
    }

    public void setMaBan(String maBan) {
        this.maBan = maBan;
    }

    public List<ItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemRequest> items) {
        this.items = items;
    }
    public String getMaCa() {return maCa;}
    public void setMaCa(String maCa) {this.maCa = maCa;}
}
