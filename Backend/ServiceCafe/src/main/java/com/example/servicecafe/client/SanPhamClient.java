package com.example.servicecafe.client;

import com.example.servicecafe.dto.SanPhamDTO; // Đảm bảo dùng SanPhamDTO có chứa danh sách công thức
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Đổi localhost thành service-product và port thành 8087
@FeignClient(name = "SERVICE-PRODUCT", path = "/v1/san-pham")
public interface SanPhamClient {
    @GetMapping("/{id}")
    SanPhamDTO getProductById(@PathVariable("id") String id);
}
