package com.example.serviceuser.service;

import com.example.serviceuser.client.SalaryClient;
import com.example.serviceuser.entity.NhanVien;
import com.example.serviceuser.entity.TaiKhoan;
import com.example.serviceuser.repository.NhanVienRepository;
import com.example.serviceuser.repository.TaiKhoanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NhanVienService {
    @Autowired
    private SalaryClient salaryClient;

    private final NhanVienRepository nhanVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final IdGeneratorService idGenerator;
    private final PasswordEncoder passwordEncoder;

    // Khởi tạo RestTemplate
    private final RestTemplate restTemplate = new RestTemplate();

    // 1. LẤY DANH SÁCH: Chỉ lấy người đang làm
    public List<NhanVien> findAll() {
        return nhanVienRepository.findByTrangThai("Đang làm");
    }

    @Transactional
    public void delete(String maNV) {
        // 1. Tìm thực thể nhân viên
        NhanVien nv = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));

        // 2. Kiểm tra lịch sử bên ServiceSalary
        boolean coLichSu = false;
        try {
            coLichSu = salaryClient.hasHistory(maNV);
        } catch (Exception e) {
            coLichSu = true; // Nếu service lương sập, mặc định xóa mềm để an toàn
        }

        // 3. Xử lý Tài khoản
        taiKhoanRepository.findByNhanVienMaNhanVien(maNV).ifPresent(tk -> {
            nv.setTaiKhoan(null);      // Bước 1: Gỡ liên kết trong Java
            taiKhoanRepository.delete(tk); // Bước 2: Lệnh xóa tài khoản
            taiKhoanRepository.flush();    // Bước 3: Ép SQL xóa ngay lập tức
        });

        // 4. Thực thi xóa hoặc ẩn
        if (coLichSu) {
            nv.setTrangThai("Đã nghỉ"); // Xóa mềm
            nhanVienRepository.save(nv);
        } else {
            try {
                nhanVienRepository.delete(nv); // Xóa cứng
            } catch (Exception e) {
                nv.setTrangThai("Đã nghỉ");
                nhanVienRepository.save(nv);
            }
        }
    }

    @Transactional
    public NhanVien addNhanVien(NhanVien nv) {
        String loai = "Quản lý".equals(nv.getChucVu()) ? "QL" : "NV";
        nv.setMaNhanVien(idGenerator.taoMaNhanVien(loai));
        nv.setNgayVaoLam(java.time.LocalDate.now());

        // Trạng thái mặc định khi thêm mới
        nv.setTrangThai("Đang làm");

        NhanVien savedNv = nhanVienRepository.save(nv);

        TaiKhoan tk = new TaiKhoan();
        tk.setMaTaiKhoan(idGenerator.taoMaTaiKhoan());
        tk.setTenDangNhap(nv.getTenDangNhap());
        tk.setMatKhau(passwordEncoder.encode("123456"));

        String chucVu = nv.getChucVu();
        tk.setLoaiTaiKhoan("Quản lý".equals(chucVu) ? "ADMIN" : "STAFF");

        tk.setNhanVien(savedNv);
        taiKhoanRepository.save(tk);

        return savedNv;
    }

    @Transactional
    public NhanVien update(String maNV, NhanVien data) {
        NhanVien nv = nhanVienRepository.findById(maNV)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên: " + maNV));

        if (data.getTenNhanVien() == null || data.getTenNhanVien().isBlank()) {
            throw new RuntimeException("Tên nhân viên không được để trống");
        }

        nv.setTenNhanVien(data.getTenNhanVien());
        nv.setChucVu(data.getChucVu());
        nv.setTienLuong(data.getTienLuong());
        nv.setNgaySinh(data.getNgaySinh());

        return nhanVienRepository.save(nv);
    }

    public boolean existsById(String maNhanVien) {
        return nhanVienRepository.existsById(maNhanVien);
    }

    public Optional<NhanVien> getNhanVienByUsername(String username) {
        return nhanVienRepository.findByUsernameFromAccount(username);
    }

    public String getTenNhanVien(String maNV) {
        return nhanVienRepository.findTenByMa(maNV)
                .orElse("Nhân viên không tồn tại");
    }

    public String getTenHienTai(String username) {
        return nhanVienRepository.findTenByUsername(username)
                .orElse("Khách");
    }
}