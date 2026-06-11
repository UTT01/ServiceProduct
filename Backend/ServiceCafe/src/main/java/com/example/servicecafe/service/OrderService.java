package com.example.servicecafe.service;

import com.example.servicecafe.client.TableServiceClient;
import com.example.servicecafe.dto.*;
import com.example.servicecafe.entity.ChiTietHD;
import com.example.servicecafe.entity.HoaDon;
import com.example.servicecafe.repository.ChiTietHDRepository;
import com.example.servicecafe.repository.HoaDonRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired
    private ChiTietHDRepository chiTietRepository;

    @Autowired
    private TableServiceClient tableServiceClient;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;



    @Transactional
    public HoaDon createOrder(OrderRequestDTO request) {

        String maHD = HoaDonIdGenerator.newHoaDonId();
        HoaDon hd = new HoaDon();
        hd.setMaHoaDon(maHD);
        hd.setMaBan(request.getMaBan());
        hd.setThoiGianVao(LocalDateTime.now());
        hd.setTrangThaiThanhToan("Pending"); // Đang xử lý

        Double tongTien = 0.0;

        // 2. Lưu hóa đơn trước để có ID liên kết
        HoaDon savedHD = hoaDonRepository.save(hd);

        // 3. Duyệt danh sách món ăn và lưu ChiTietHoaDon
        int index = 1;
        for (OrderRequestDTO.ItemRequest item : request.getItems()) {
            String maChiTietHD = HoaDonIdGenerator.newChiTietHoaDonId();
            ChiTietHD ct = new ChiTietHD();
            ct.setMaChiTietHD(maChiTietHD);
            ct.setMaHoaDon(savedHD);
            ct.setMaSanPham(item.getMaSanPham());
            ct.setSoLuong(item.getSoLuong());
            ct.setDonGia(item.getGiaBan());

            tongTien += item.getSoLuong() * item.getGiaBan();
            chiTietRepository.save(ct);
        }

        // 4. Cập nhật lại tổng tiền cho hóa đơn
        savedHD.setTongTien(tongTien);
        messagingTemplate.convertAndSend("/topic/orders", savedHD);
        return hoaDonRepository.save(savedHD);
    }

    @Transactional
    public Map<String, Object> staffCreateOrder(OrderRequestDTO request) {
        // 1. Tìm hóa đơn đang Pending của bàn
        Optional<HoaDon> existingHD = hoaDonRepository.findTop1ByMaBanAndTrangThaiThanhToanOrderByThoiGianVaoDesc(request.getMaBan(), "PENDING");
        HoaDon hd;
        List<ChiTietHD> newItemsForKitchen = new ArrayList<>();

        if (existingHD.isPresent()) {
            hd = existingHD.get();
            List<ChiTietHD> currentDetails = chiTietRepository.findByMaHoaDon(hd);

            // 1. Duyệt qua danh sách món từ React gửi lên
            for (OrderRequestDTO.ItemRequest newItem : request.getItems()) {
                Optional<ChiTietHD> oldItemOpt = currentDetails.stream()
                        .filter(d -> d.getMaSanPham().equals(newItem.getMaSanPham()))
                        .findFirst();

                if (oldItemOpt.isPresent()) {
                    ChiTietHD detail = oldItemOpt.get();

                    // --- TĂNG SỐ LƯỢNG ---
                    if (newItem.getSoLuong() > detail.getSoLuong()) {
                        int diff = newItem.getSoLuong() - detail.getSoLuong();
                        newItemsForKitchen.add(createKitchenSlip(detail.getMaSanPham(), diff, newItem.getGhiChu(), "THÊM MÓN"));
                    }
                    // --- GIẢM SỐ LƯỢNG (Hải muốn cái này đây!) ---
                    else if (newItem.getSoLuong() < detail.getSoLuong()) {
                        int diff = detail.getSoLuong() - newItem.getSoLuong();
                        newItemsForKitchen.add(createKitchenSlip(detail.getMaSanPham(), diff, newItem.getGhiChu(), "HỦY BỚT"));
                    }

                    // Cập nhật DB
                    detail.setSoLuong(newItem.getSoLuong());
                    detail.setGhiChu(newItem.getGhiChu());
                    detail.setDonGia(newItem.getGiaBan());
                    chiTietRepository.save(detail);

                } else {
                    // Món mới hoàn toàn
                    ChiTietHD ct = new ChiTietHD();
                    ct.setMaChiTietHD(HoaDonIdGenerator.newChiTietHoaDonId());
                    ct.setMaHoaDon(hd);
                    ct.setMaSanPham(newItem.getMaSanPham());
                    ct.setSoLuong(newItem.getSoLuong());
                    ct.setDonGia(newItem.getGiaBan());
                    ct.setGhiChu(newItem.getGhiChu());
                    chiTietRepository.save(ct);
                    newItemsForKitchen.add(ct);
                }
            }

            // 2. LOGIC HỦY HẲN MÓN: Món có trong DB nhưng React không gửi lên nữa
            for (ChiTietHD old : currentDetails) {
                // Dùng Objects.equals để so sánh an toàn, và check null mã sản phẩm gửi lên
                boolean stillExists = request.getItems().stream()
                        .filter(n -> n.getMaSanPham() != null) // Lọc bỏ các item lỗi từ frontend
                        .anyMatch(n -> Objects.equals(n.getMaSanPham(), old.getMaSanPham()));

                if (!stillExists) {
                    // Bắn tin xuống bếp báo hủy toàn bộ món này
                    newItemsForKitchen.add(createKitchenSlip(old.getMaSanPham(), old.getSoLuong(), "HỦY TOÀN BỘ", "HỦY MÓN"));
                    chiTietRepository.delete(old);
                }
            }
        } else {
            // --- TRƯỜNG HỢP 2: BÀN MỚI TINH (CREATE) ---
            String maHD = HoaDonIdGenerator.newHoaDonId();
            hd = new HoaDon();
            hd.setMaHoaDon(maHD);
            hd.setMaBan(request.getMaBan());
            hd.setThoiGianVao(LocalDateTime.now());
            hd.setTrangThaiThanhToan("PENDING");
            hd.setMaCa(request.getMaCa());
            hoaDonRepository.save(hd); // Lưu nháp để lấy làm khóa ngoại

            int index = 1;
            for (OrderRequestDTO.ItemRequest item : request.getItems()) {
                ChiTietHD ct = new ChiTietHD();
                ct.setMaChiTietHD(HoaDonIdGenerator.newChiTietHoaDonId());
                ct.setMaHoaDon(hd);
                ct.setMaSanPham(item.getMaSanPham());
                ct.setSoLuong(item.getSoLuong());
                ct.setDonGia(item.getGiaBan());
                ct.setGhiChu(item.getGhiChu()); // <--- Đảm bảo có dòng này để lưu vào SQL Server

                chiTietRepository.save(ct);
                newItemsForKitchen.add(ct); // Đơn mới thì in tất cả
            }

        }

        // Cập nhật tổng tiền và lưu lại
        Double total = chiTietRepository.findByMaHoaDon(hd).stream()
                .mapToDouble(d -> d.getSoLuong() * d.getDonGia())
                .sum();

        hd.setTongTien(total);
        HoaDon savedHD = hoaDonRepository.save(hd);

        messagingTemplate.convertAndSend("/topic/orders", savedHD);

        return Map.of("hoaDon", savedHD, "printToKitchen", newItemsForKitchen);
    }

    private ChiTietHD createKitchenSlip(String maSP, int qty, String note, String actionTag) {
        ChiTietHD slip = new ChiTietHD();
        slip.setMaSanPham(maSP);
        slip.setSoLuong(qty);
        slip.setGhiChu("[" + actionTag + "] " + (note != null ? note : ""));
        return slip;
    }
    @Transactional
    public HoaDon checkout(String maHoaDon, String phuongThuc) {
        HoaDon hd = hoaDonRepository.findById(maHoaDon)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        // 1. Cập nhật trạng thái hóa đơn
        hd.setTrangThaiThanhToan("Paid");
        hd.setPhuongThucThanhToan(phuongThuc);
        hd.setThoiGianRa(LocalDateTime.now());
        // 2. LƯU Ý QUAN TRỌNG: Gọi API của Khánh để đổi trạng thái bàn về 'EMPTY'
        // (Dùng RestTemplate hoặc OpenFeign để gọi sang Service của Khánh)
        try {
            tableServiceClient.updateTableStatus(hd.getMaBan(), "EMPTY");
        } catch (Exception e) {
            System.err.println(">>> KHÁNH CHƯA ONLINE: Không đổi màu bàn về xanh được!");
        }
        // 3. Bắn WebSocket để tất cả máy POS khác cập nhật bàn thành màu TRẮNG
        messagingTemplate.convertAndSend("/topic/tables", "Bàn " + hd.getMaBan() + " đã trống");

        return hoaDonRepository.save(hd);
    }

    public List<HoaDon> getAllPendingOrders() {
        return hoaDonRepository.findByTrangThaiThanhToan("Pending");
    }

    private static final Map<String, String> PRODUCT_NAMES = Map.of(
            "CF01", "Cafe Đen Đá",
            "CF02", "Cafe Sữa Sài Gòn",
            "TS01", "Trà Sữa Trân Châu",
            "TS02", "Trà Đào Cam Sả",
            "CF03", "Cafe Đen Nóng",
            "CF04", "Cafe Sữa Đá",
            "TS03", "Trà Hoa Quả",
            "TS04", "Trà Mãng Cầu",
            "BK01", "Bánh Mì Que"
    );

    public OrderRequestDTO getActiveBillByTable(String maBan) {
        Optional<HoaDon> hdOpt = hoaDonRepository.findTop1ByMaBanAndTrangThaiThanhToanOrderByThoiGianVaoDesc(maBan, "PENDING");

        if (hdOpt.isEmpty()) return null;

        HoaDon hd = hdOpt.get();
        OrderRequestDTO dto = new OrderRequestDTO();
        dto.setMaHoaDon(hd.getMaHoaDon());
        dto.setMaBan(hd.getMaBan());


        List<OrderRequestDTO.ItemRequest> items = hd.getChiTietHDs().stream()
                .map(ct -> {
                    OrderRequestDTO.ItemRequest item = new OrderRequestDTO.ItemRequest();
                    item.setMaChiTietHD(ct.getMaChiTietHD()); // Trả về ID để sau này xóa
                    item.setMaSanPham(ct.getMaSanPham());

                    // Lấy tên món từ Map PRODUCT_NAMES của Hải
                    String ten = PRODUCT_NAMES.getOrDefault(ct.getMaSanPham(), "Món " + ct.getMaSanPham());
                    item.setTenSanPham(ten);

                    item.setSoLuong(ct.getSoLuong());
                    item.setGiaBan(ct.getDonGia());
                    item.setGhiChu(ct.getGhiChu());
                    return item;
                }).collect(Collectors.toList());

        dto.setItems(items);
        return dto;
    }

    @Transactional
    public void removeOrderItem(String maChiTietHD) {
        // 1. Tìm chi tiết hóa đơn
        ChiTietHD ct = chiTietRepository.findById(maChiTietHD)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn này trong đơn"));

        HoaDon hd = ct.getMaHoaDon();

        // 🛑 BẢO VỆ: Chỉ cho phép xóa nếu đơn đang chờ (PENDING)
        if (!"PENDING".equalsIgnoreCase(hd.getTrangThaiThanhToan())) {
            throw new RuntimeException("Không thể xóa món trong hóa đơn đã thanh toán hoặc đã hủy!");
        }

        // 2. Tính lại tiền trước khi xóa (Dùng trừ trực tiếp cho nhanh)
        double amountToRemove = ct.getSoLuong() * ct.getDonGia();
        double currentTotal = hd.getTongTien();
        hd.setTongTien(Math.max(0, currentTotal - amountToRemove));

        // 3. Đồng bộ bộ nhớ và xóa DB
        hd.getChiTietHDs().remove(ct); // Quan trọng để tránh lỗi Hibernate dửng dưng
        chiTietRepository.delete(ct);

        // 4. Lưu lại thằng cha
        hoaDonRepository.save(hd);

        // 5. Bắn WebSocket cập nhật sơ đồ bàn
        messagingTemplate.convertAndSend("/topic/tables", hd.getMaBan());
    }

}
