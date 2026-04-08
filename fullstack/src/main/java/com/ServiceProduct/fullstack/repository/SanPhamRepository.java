package com.ServiceProduct.fullstack.repository;

import com.ServiceProduct.fullstack.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SanPhamRepository extends JpaRepository<SanPham, String> {
    List<SanPham> findByTenSanPhamContainingIgnoreCase(String tenSanPham);
}