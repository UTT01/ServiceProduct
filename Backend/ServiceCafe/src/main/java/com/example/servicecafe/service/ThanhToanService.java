package com.example.servicecafe.service;

import com.example.servicecafe.dto.PaymentDTO;
import com.example.servicecafe.dto.SanPhamDTO;
import com.example.servicecafe.entity.*;
import com.example.servicecafe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.messaging.simp.SimpMessagingTemplate; // Đảm bảo đã import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.example.servicecafe.client.SanPhamClient;
import com.example.servicecafe.client.StoreClient;
import org.springframework.util.StringUtils;
import java.util.stream.Collectors;

@Service
public class ThanhToanService {

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private ChiTietHDRepository chiTietRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private SanPhamClient sanPhamClient;

    @Autowired
    private StoreClient storeClient;

    @Modifying
    @Transactional
    public void xuLyThanhToan(PaymentDTO dto) {
        try {
            String inputMaHD = dto.getMaHoaDon();
            System.out.println(">>> [DEBUG] Bắt đầu xử lý HD: " + inputMaHD);

            HoaDon hd = null;
            if (inputMaHD != null && !inputMaHD.trim().isEmpty() && !"undefined".equals(inputMaHD)) {
                hd = hoaDonRepository.findById(inputMaHD).orElse(null);
            }

            if (hd == null) {
                hd = new HoaDon();
                String finalMaHD = (inputMaHD != null && !inputMaHD.trim().isEmpty() && !"undefined".equals(inputMaHD))
                        ? inputMaHD
                        : HoaDonIdGenerator.newHoaDonId();
                hd.setMaHoaDon(finalMaHD);
                hd.setThoiGianVao(LocalDateTime.now().minusMinutes(30));
            }

            hd.setMaBan(dto.getMaBan());
            hd.setMaCa(dto.getMaCa());
            hd.setPhuongThucThanhToan(dto.getPhuongThucThanhToan());
            hd.setMaKhuyenMai(dto.getMaKhuyenMai());
            hd.setTongTien(dto.getTongTienSauKM());
            hd.setTrangThaiThanhToan("Paid");
            hd.setThoiGianRa(LocalDateTime.now());

            HoaDon savedHd = hoaDonRepository.save(hd);

            // Map để cộng dồn tất cả nguyên liệu cần trừ từ các sản phẩm khác nhau
            Map<String, Double> tongNguyenLieuCanTru = new HashMap<>();

            if (dto.getItems() != null && !dto.getItems().isEmpty()) {
                chiTietRepository.deleteByMaHoaDon(savedHd);
                chiTietRepository.flush();

                int index = 1;
                List<ChiTietHD> chiTiets = new ArrayList<>();
                for (var itemDto : dto.getItems()) {
                    // 1. Lưu chi tiết hóa đơn vào DB Cafe
                    ChiTietHD ct = new ChiTietHD();
                    ct.setMaChiTietHD(HoaDonIdGenerator.newChiTietHoaDonId());
                    ct.setMaHoaDon(savedHd);
                    ct.setMaSanPham(itemDto.getMaSanPham());
                    ct.setSoLuong(itemDto.getSoLuong());
                    ct.setDonGia(itemDto.getGiaBan());
                    ct.setGhiChu(itemDto.getGhiChu());
                    chiTiets.add(ct);

                    // 2. Logic trừ kho: Lấy công thức từ ServiceProduct
                    try {
                        SanPhamDTO spInfo = sanPhamClient.getProductById(itemDto.getMaSanPham());
                        if (spInfo != null && spInfo.getDanhSachCongThuc() != null) {
                            for (var recipe : spInfo.getDanhSachCongThuc()) {
                                String maNL = recipe.getMaNguyenLieu();
                                if (!StringUtils.hasText(maNL) || recipe.getSoLuong() == null || itemDto.getSoLuong() == null) {
                                    System.err.println("Bo qua cong thuc thieu du lieu cho SP: " + itemDto.getMaSanPham());
                                    continue;
                                }
                                // Định lượng 1 ly * Số lượng ly khách mua
                                double dinhLuongCanTru = recipe.getSoLuong() * itemDto.getSoLuong();
                                
                                tongNguyenLieuCanTru.put(maNL, tongNguyenLieuCanTru.getOrDefault(maNL, 0.0) + dinhLuongCanTru);
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Không thể lấy công thức cho SP: " + itemDto.getMaSanPham());
                    }
                }
                chiTietRepository.saveAll(chiTiets);
            }

            // 3. Gọi ServiceStore để cập nhật tồn kho một lần duy nhất
            if (!tongNguyenLieuCanTru.isEmpty()) {
                List<Map<String, Object>> requests = tongNguyenLieuCanTru.entrySet().stream()
                    .map(entry -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("maNguyenLieu", entry.getKey());
                        map.put("soLuongTru", entry.getValue());
                        return map;
                    }).collect(Collectors.toList());
                
                storeClient.truKhoNguyenLieu(requests);
                System.out.println(">>> [SUCCESS] Đã gửi yêu cầu trừ kho cho " + requests.size() + " nguyên liệu.");
            }

            messagingTemplate.convertAndSend("/topic/tables", dto.getMaBan());
            System.out.println(">>> [SUCCESS] Đã thanh toán xong bàn: " + dto.getMaBan());

        } catch (Exception e) {
            System.err.println("❌ LỖI THANH TOÁN: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
