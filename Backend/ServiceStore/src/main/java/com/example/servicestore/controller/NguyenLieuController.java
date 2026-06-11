package com.example.servicestore.controller;

import com.example.servicestore.dto.TruKhoRequest;
import com.example.servicestore.entity.NguyenLieu;
import com.example.servicestore.repository.NguyenLieuRepository;
import com.example.servicestore.service.NguyenLieuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/nguyen-lieu")
@RequiredArgsConstructor
public class NguyenLieuController {
    private final NguyenLieuRepository nguyenLieuRepository;
    private final NguyenLieuService nguyenLieuService;

    @GetMapping
    public ResponseEntity<List<NguyenLieu>> getAll() {
        return ResponseEntity.ok(nguyenLieuRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<NguyenLieu> save(@RequestBody NguyenLieu nguyenLieu) {
        return ResponseEntity.ok(nguyenLieuRepository.save(nguyenLieu));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        nguyenLieuRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tru-kho")
    public ResponseEntity<String> truKho(@RequestBody List<TruKhoRequest> requests) {
        nguyenLieuService.truKho(requests);
        return ResponseEntity.ok("Tru kho thanh cong");
    }
}
