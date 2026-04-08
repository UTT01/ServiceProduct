package com.ServiceProduct.fullstack.controller;

import com.ServiceProduct.fullstack.dto.response.SanPhamResponse;
import com.ServiceProduct.fullstack.entity.SanPham;
import com.ServiceProduct.fullstack.service.SanPhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/san-pham")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173") // Cho phép Frontend (React/Vue/Swing call API)
public class SanPhamController {

    private final SanPhamService sanPhamService;

    // GET: /api/v1/san-pham
    @GetMapping
    public ResponseEntity<List<SanPhamResponse>> getAll() {
        return ResponseEntity.ok(sanPhamService.getAllSanPham());
    }

    // POST: /api/v1/san-pham
    @PostMapping
    public ResponseEntity<SanPham> create(@RequestBody SanPham sanPham) {
        return ResponseEntity.ok(sanPhamService.saveSanPham(sanPham));
    }

    // DELETE: /api/v1/san-pham/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        sanPhamService.deleteSanPham(id);
        return ResponseEntity.noContent().build();
    }
}