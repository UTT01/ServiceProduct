package com.example.servicecafe.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SanPhamDTO {
    private String maSanPham;
    private String tenSanPham;
    private Double giaBan;

    private List<CongThucDTO> danhSachCongThuc;
}
