import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Import cả 2 giao diện
import SanPhamList from './components/SanPhamList';
import NguyenLieuList from './components/NguyenLieuList';

function App() {
  return (
    <Router>
      <div>
        {/* Thanh Điều Hướng (Navbar) */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <Link className="navbar-brand fw-bold" to="/">☕ CAFE MANAGER</Link>
            <div className="collapse navbar-collapse">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link text-info fw-bold" to="/san-pham">Sản Phẩm</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-warning fw-bold" to="/kho">Kho Nguyên Liệu</Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* Khu vực hiển thị Nội Dung */}
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<h2 className="text-center mt-5">Hệ Thống Quản Lý Đa Dịch Vụ (Microservices)</h2>} />
            
            {/* Route gọi cổng 8080 */}
            <Route path="/san-pham" element={<SanPhamList />} />
            
            {/* Route gọi cổng 8081 */}
            <Route path="/kho" element={<NguyenLieuList />} /> 
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;