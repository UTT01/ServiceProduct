package com.example.servicecafe.controller;

import com.example.servicecafe.dto.OrderRequestDTO;
import com.example.servicecafe.dto.SanPhamDTO;
import com.example.servicecafe.entity.HoaDon;
import com.example.servicecafe.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

// Dành cho khách tự order
    @PostMapping("/create")
    public ResponseEntity<HoaDon> createOrder(@RequestBody OrderRequestDTO request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @PostMapping("/staff-create")
    public ResponseEntity<Map<String, Object>> staffCreateOrder(@RequestBody OrderRequestDTO request) {
        Map<String, Object> result = orderService.staffCreateOrder(request);
        request.getItems().forEach(item ->
                System.out.println(">>> Backend nhan maCa: "+ request.getMaCa())
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<HoaDon>> getPendingOrders() {
        return ResponseEntity.ok(orderService.getAllPendingOrders());
    }

    @PostMapping("/{maHD}/checkout")
    public ResponseEntity<String> checkout(
            @PathVariable String maHD,
            @RequestParam String phuongThuc) {

        orderService.checkout(maHD, phuongThuc);
        return ResponseEntity.ok("Thanh toán thành công cho đơn: " + maHD);
    }



    @GetMapping("/loadBan/{maBan}")
    public ResponseEntity<OrderRequestDTO> getHoaDon(@PathVariable String maBan){
        OrderRequestDTO bill = orderService.getActiveBillByTable(maBan);
        return ResponseEntity.ok(bill);
    }

    @DeleteMapping("/remove-item/{maChiTietHD}")
    public ResponseEntity<?> removeOrderItem(@PathVariable String maChiTietHD) {
        try {
            // Gọi Service xử lý xóa và trừ tiền
            orderService.removeOrderItem(maChiTietHD);

            // Trả về thông báo thành công cho React
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Đã xóa món và cập nhật lại tổng tiền hóa đơn thành công!"
            ));
        } catch (RuntimeException e) {
            // Nếu có lỗi (ví dụ món không tồn tại hoặc đơn đã thanh toán)
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            // Lỗi hệ thống không mong muốn
            return ResponseEntity.status(500).body(Map.of(
                    "status", "error",
                    "message", "Lỗi server: " + e.getMessage()
            ));
        }
    }

}
