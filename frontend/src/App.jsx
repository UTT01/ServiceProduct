import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// 1. Import đầy đủ các component
import SanPhamList from "./pages/SanPham/SanPhamList";
import NguyenLieuList from "./pages/Kho/NguyenLieuList";
import LoaiSanPhamList from "./pages/LoaiSanPham/LoaiSanPhamList";
function App() {
  return (
    <Router>
      <div>
        {/* Thanh Điều Hướng (Navbar) */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">☕ CAFE MANAGER</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link text-info fw-bold" to="/san-pham">Sản Phẩm</Link>
                </li>
                
                {/* 2. Sửa nút thành Link để đồng bộ với Router */}
                <li className="nav-item">
                  <Link className="nav-link text-white fw-bold" to="/loai-san-pham">
                    📁 Loại Sản Phẩm
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link text-warning fw-bold" to="/kho">Kho Nguyên Liệu</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Khu vực hiển thị Nội Dung (Main Content) */}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={
              <div className="text-center mt-5">
                <h2>Hệ Thống Quản Lý Cafe</h2>
                <p className="text-muted">Vui lòng chọn một mục trên thanh điều hướng để bắt đầu.</p>
              </div>
            } />
            
            {/* 3. Thêm Route cho Loại sản phẩm vào đây */}
            <Route path="/san-pham" element={<SanPhamList />} />
            <Route path="/loai-san-pham" element={<LoaiSanPhamList />} />
            <Route path="/kho" element={<NguyenLieuList />} /> 
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;