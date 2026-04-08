package com.ServiceProduct.fullstack.controller;

import com.ServiceProduct.fullstack.entity.LoaiSanPham;
import com.ServiceProduct.fullstack.repository.LoaiSanPhamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/loai-san-pham")
@CrossOrigin("http://localhost:5173")
public class LoaiSanPhamController {

    @Autowired
    private LoaiSanPhamRepository repository;

    @GetMapping
    public List<LoaiSanPham> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public LoaiSanPham create(@RequestBody LoaiSanPham loai) {
        // Tạo mã tự động nếu cần hoặc nhận từ Frontend
        return repository.save(loai);
    }

    @PutMapping("/{id}")
    public LoaiSanPham update(@PathVariable String id, @RequestBody LoaiSanPham loai) {
        loai.setMaLoaiSanPham(id);
        return repository.save(loai);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        repository.deleteById(id);
    }
}