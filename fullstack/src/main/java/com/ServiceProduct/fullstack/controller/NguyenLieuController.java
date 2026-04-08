package com.ServiceProduct.fullstack.controller;

import com.ServiceProduct.fullstack.entity.NguyenLieu;
import com.ServiceProduct.fullstack.repository.NguyenLieuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/nguyen-lieu")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:5173")
public class NguyenLieuController {
    private final NguyenLieuRepository nguyenLieuRepository;

    @GetMapping
    public ResponseEntity<List<NguyenLieu>> getAll() {
        return ResponseEntity.ok(nguyenLieuRepository.findAll());
    }
}