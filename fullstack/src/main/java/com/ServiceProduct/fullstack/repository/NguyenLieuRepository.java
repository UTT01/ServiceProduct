package com.ServiceProduct.fullstack.repository;

import com.ServiceProduct.fullstack.entity.NguyenLieu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NguyenLieuRepository extends JpaRepository<NguyenLieu, String> {
    // Truy vấn custom: Tìm các nguyên liệu đang thiếu hàng (số lượng tồn < số lượng trong công thức)
    @Query("SELECT DISTINCT nl FROM CongThuc ct JOIN ct.nguyenLieu nl WHERE nl.soLuong < ct.soLuong")
    List<NguyenLieu> findShortageIngredients();
}