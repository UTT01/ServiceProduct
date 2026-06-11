package com.example.servicecafe.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import java.util.Map;

// Đổi thành service-store và port 8088
@FeignClient(name = "SERVICE-STORE", path = "/nguyen-lieu")
public interface StoreClient {
    @PostMapping("/tru-kho")
    void truKhoNguyenLieu(@RequestBody List<Map<String, Object>> requests);
}
