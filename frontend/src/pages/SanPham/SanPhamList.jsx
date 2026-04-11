import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig'; 
import apiStore from '../../api/axiosStore'; 
import SanPhamForm from '../../components/SanPham/SanPhamForm';

const SanPhamList = () => {
    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [sanPhams, setSanPhams] = useState([]);
    const [khoNguyenLieu, setKhoNguyenLieu] = useState([]);
    const [loaiSanPhams, setLoaiSanPhams] = useState([]);
    
    // STATE TÌM KIẾM & BỘ LỌC
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    
    // STATE ĐIỀU HƯỚNG GIAO DIỆN
    const [currentView, setCurrentView] = useState('LIST'); // 'LIST' hoặc 'FORM'
    const [editData, setEditData] = useState(null);
    const [editCongThuc, setEditCongThuc] = useState([]);

    // ==========================================
    // HOOK: CHẠY KHI MỞ TRANG
    // ==========================================
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [spRes, nlRes, lspRes] = await Promise.all([
                api.get('/san-pham'),
                apiStore.get('/nguyen-lieu'),
                api.get('/loai-san-pham') 
            ]);
            setSanPhams(spRes.data);
            setKhoNguyenLieu(nlRes.data);
            setLoaiSanPhams(lspRes.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        }
    };

    // ==========================================
    // CÁC HÀM XỬ LÝ SỰ KIỆN
    // ==========================================
    const handleDelete = async (maSanPham) => {
        if (window.confirm("Xóa sản phẩm này sẽ xóa luôn công thức của nó. Tiếp tục?")) {
            await api.delete(`/san-pham/${maSanPham}`);
            loadData();
        }
    };

    const handleEdit = (sp) => {
        const formData = {
            maSanPham: sp.maSanPham,
            tenSanPham: sp.tenSanPham,
            donGia: sp.donGia,
            maLoaiSanPham: sp.maLoaiSanPham || 'LSP01',
            trangThai: sp.trangThai,
            duongDanHinh: sp.duongDanHinh || '' 
        };
        
        let mappedCT = [];
        if (sp.danhSachCongThuc && sp.danhSachCongThuc.length > 0) {
            mappedCT = sp.danhSachCongThuc.map(ct => {
                const nlInfo = khoNguyenLieu.find(nl => nl.maNguyenLieu === ct.id.maNguyenLieu);
                return {
                    maNguyenLieu: ct.id.maNguyenLieu,
                    tenNguyenLieu: nlInfo ? nlInfo.tenNguyenLieu : (ct.nguyenLieu?.tenNguyenLieu || 'N/A'),
                    soLuong: ct.soLuong,
                    donViTinh: nlInfo ? nlInfo.donViTinh : (ct.nguyenLieu?.donViTinh || '')
                };
            });
        }
        
        setEditData(formData);
        setEditCongThuc(mappedCT);
        setCurrentView('FORM');
    };

    // Chuẩn bị danh mục duy nhất cho bộ lọc
    const uniqueCategories = [...new Set(sanPhams.map(sp => sp.tenLoaiSanPham || sp.maLoaiSanPham || 'Chưa phân loại'))];

    const filteredSanPhams = sanPhams.filter(sp => {
        const matchSearch = sp.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            sp.maSanPham.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryName = sp.tenLoaiSanPham || sp.maLoaiSanPham || 'Chưa phân loại';
        const matchCategory = filterCategory === '' || categoryName === filterCategory;

        return matchSearch && matchCategory;
    });

    // ==========================================
    // ĐIỀU HƯỚNG HIỂN THỊ
    // ==========================================
    if (currentView === 'FORM') {
        return <SanPhamForm 
            isEditing={!!editData} 
            initialData={editData} 
            initialCongThuc={editCongThuc}
            khoNguyenLieu={khoNguyenLieu}
            loaiSanPhams={loaiSanPhams}
            onRefresh={loadData}
            onClose={() => setCurrentView('LIST')}
        />;
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="m-0">Quản lý Sản phẩm</h2>
                <div className="d-flex gap-3">
                    <select className="form-select border-primary" style={{ width: '200px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                        <option value="">-- Tất cả loại --</option>
                        {uniqueCategories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <input type="text" className="form-control" placeholder="🔍 Tìm tên hoặc mã SP..." style={{ width: '250px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <button className="btn btn-success fw-bold text-nowrap" onClick={() => { setEditData(null); setEditCongThuc([]); setCurrentView('FORM'); }}>
                        + Thêm Sản Phẩm Mới
                    </button>
                </div>
            </div>
            
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover table-bordered text-center align-middle m-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Ảnh</th><th>Mã SP</th><th>Tên Sản Phẩm</th><th>Loại</th><th>Đơn giá</th><th>Trạng thái</th><th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSanPhams.length === 0 ? (
                                <tr><td colSpan="7" className="p-4 text-muted">Không tìm thấy sản phẩm nào!</td></tr>
                            ) : (
                                filteredSanPhams.map((sp) => (
                                    <tr key={sp.maSanPham}>
                                        <td style={{ width: '80px' }}>
                                            {sp.duongDanHinh ? (
                                                <img src={sp.duongDanHinh} alt="ảnh sp" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />
                                            ) : (
                                                <div style={{ width: '60px', height: '60px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                                                    <span className="text-muted small">No IMG</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="fw-bold">{sp.maSanPham}</td>
                                        <td className="text-start">{sp.tenSanPham}</td>
                                        <td>{sp.tenLoaiSanPham || sp.maLoaiSanPham || 'Chưa phân loại'}</td>
                                        <td className="text-danger fw-bold">{sp.donGia?.toLocaleString('vi-VN')} đ</td>
                                        <td>
                                            <span className={`badge ${sp.trangThai === 'Đang bán' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {sp.trangThai}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(sp)}>Sửa / Công Thức</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(sp.maSanPham)}>Xóa</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SanPhamList;