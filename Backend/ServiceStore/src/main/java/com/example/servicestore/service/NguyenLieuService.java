package com.example.servicestore.service;

import com.example.servicestore.dto.TruKhoRequest;
import com.example.servicestore.entity.NguyenLieu;
import com.example.servicestore.repository.NguyenLieuRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NguyenLieuService {

    private final NguyenLieuRepository repository;

    public List<NguyenLieu> getAllNguyenLieu() {
        return repository.findAll();
    }

    public NguyenLieu saveNguyenLieu(NguyenLieu nguyenLieu) {
        return repository.save(nguyenLieu);
    }

    public void deleteNguyenLieu(String maNguyenLieu) {
        repository.deleteById(maNguyenLieu);
    }

    @Transactional
    public void truKho(List<TruKhoRequest> requests) {
        for (TruKhoRequest request : requests) {
            NguyenLieu nguyenLieu = repository.findById(request.getMaNguyenLieu())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Khong tim thay nguyen lieu: " + request.getMaNguyenLieu()));

            double soLuongHienTai = nguyenLieu.getSoLuong() == null ? 0D : nguyenLieu.getSoLuong();
            double soLuongTru = request.getSoLuongTru() == null ? 0D : request.getSoLuongTru();

            if (soLuongTru < 0) {
                throw new IllegalArgumentException("So luong tru khong hop le: " + request.getMaNguyenLieu());
            }

            if (soLuongHienTai < soLuongTru) {
                throw new IllegalArgumentException("Nguyen lieu khong du so luong: " + request.getMaNguyenLieu());
            }

            nguyenLieu.setSoLuong(soLuongHienTai - soLuongTru);
            repository.save(nguyenLieu);
        }
    }
}
