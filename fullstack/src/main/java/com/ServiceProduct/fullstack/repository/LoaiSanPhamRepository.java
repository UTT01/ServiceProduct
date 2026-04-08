package com.ServiceProduct.fullstack.repository;

import com.ServiceProduct.fullstack.entity.LoaiSanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoaiSanPhamRepository extends JpaRepository<LoaiSanPham, String> {
}