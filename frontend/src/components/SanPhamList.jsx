import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig'; // API cổng 8080
import apiStore from '../api/axiosStore'; // API cổng 8081

const SanPhamList = () => {
    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [sanPhams, setSanPhams] = useState([]);
    const [khoNguyenLieu, setKhoNguyenLieu] = useState([]);
    
    // STATE TÌM KIẾM
    const [searchTerm, setSearchTerm] = useState('');
    
    // 2. STATE QUẢN LÝ GIAO DIỆN (UI)
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // 3. STATE CHO FORM NHẬP LIỆU
    const [formData, setFormData] = useState({
        maSanPham: '', tenSanPham: '', donGia: '', maLoaiSanPham: 'LSP01', trangThai: 'Đang bán', duongDanHinh: ''
    });
    
    const [congThuc, setCongThuc] = useState([]); 
    const [nlTempt, setNlTempt] = useState({ maNguyenLieu: '', soLuong: 1 });

    // ==========================================
    // HOOK: CHẠY KHI MỞ TRANG
    // ==========================================
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [spRes, nlRes] = await Promise.all([
                api.get('/san-pham'),
                apiStore.get('/nguyen-lieu')
            ]);
            setSanPhams(spRes.data);
            setKhoNguyenLieu(nlRes.data);
            
            if(nlRes.data.length > 0) {
                setNlTempt({ maNguyenLieu: nlRes.data[0].maNguyenLieu, soLuong: 1 });
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        }
    };

    // ==========================================
    // CÁC HÀM XỬ LÝ SỰ KIỆN
    // ==========================================
    const handleAddNew = () => {
        setIsEditing(false);
        setFormData({ maSanPham: '', tenSanPham: '', donGia: '', maLoaiSanPham: 'LSP01', trangThai: 'Đang bán', duongDanHinh: '' });
        setCongThuc([]);
        setShowForm(true);
    };

    const handleEdit = (sp) => {
        setIsEditing(true);
        setFormData({
            maSanPham: sp.maSanPham,
            tenSanPham: sp.tenSanPham,
            donGia: sp.donGia,
            maLoaiSanPham: sp.maLoaiSanPham || 'LSP01',
            trangThai: sp.trangThai,
            duongDanHinh: sp.duongDanHinh || '' 
        });
        
        // KIỂM TRA VÀ MAP CÔNG THỨC TỪ API
        if (sp.danhSachCongThuc && sp.danhSachCongThuc.length > 0) {
            const mappedCT = sp.danhSachCongThuc.map(ct => {
                // Tìm thông tin tên nguyên liệu từ khoNguyenLieu dựa trên ID
                const nlInfo = khoNguyenLieu.find(nl => nl.maNguyenLieu === ct.id.maNguyenLieu);
                return {
                    maNguyenLieu: ct.id.maNguyenLieu,
                    tenNguyenLieu: nlInfo ? nlInfo.tenNguyenLieu : (ct.nguyenLieu?.tenNguyenLieu || 'N/A'),
                    soLuong: ct.soLuong,
                    donViTinh: nlInfo ? nlInfo.donViTinh : (ct.nguyenLieu?.donViTinh || '')
                };
            });
            setCongThuc(mappedCT);
        } else {
            setCongThuc([]); 
        }
        setShowForm(true);
    };

    const handleDelete = async (maSanPham) => {
        if (window.confirm("Xóa sản phẩm này sẽ xóa luôn công thức của nó. Tiếp tục?")) {
            await api.delete(`/san-pham/${maSanPham}`);
            loadData();
        }
    };

    // HÀM UPLOAD ẢNH (GỌI ĐẾN ENDPOINT MỚI TẠO)
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const response = await api.post('/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Cập nhật link ảnh vào state formData
            setFormData(prev => ({ ...prev, duongDanHinh: response.data }));
        } catch (error) {
            console.error("Lỗi upload:", error);
            alert("Lỗi khi tải ảnh lên máy chủ (Kiểm tra cổng 8080 và Controller)!");
        }
    };

    const themNguyenLieuVaoCongThuc = () => {
        if (!nlTempt.maNguyenLieu || nlTempt.soLuong <= 0) return alert("Vui lòng chọn NL và nhập số lượng > 0");
        const isExist = congThuc.find(ct => ct.maNguyenLieu === nlTempt.maNguyenLieu);
        if (isExist) return alert("Nguyên liệu này đã có trong công thức!");

        const nlInfo = khoNguyenLieu.find(nl => nl.maNguyenLieu === nlTempt.maNguyenLieu);
        setCongThuc([...congThuc, {
            maNguyenLieu: nlInfo.maNguyenLieu,
            tenNguyenLieu: nlInfo.tenNguyenLieu,
            soLuong: nlTempt.soLuong,
            donViTinh: nlInfo.donViTinh
        }]);
    };

    const handleLuuThongTin = async () => {
        if(!formData.maSanPham || !formData.tenSanPham) return alert("Vui lòng nhập Mã và Tên sản phẩm!");

        const payload = {
            maSanPham: formData.maSanPham,
            tenSanPham: formData.tenSanPham,
            donGia: formData.donGia,
            trangThai: formData.trangThai,
            duongDanHinh: formData.duongDanHinh, 
            loaiSanPham: { maLoaiSanPham: formData.maLoaiSanPham },
            danhSachCongThuc: congThuc.map(ct => ({
                id: { maSanPham: formData.maSanPham, maNguyenLieu: ct.maNguyenLieu },
                nguyenLieu: { maNguyenLieu: ct.maNguyenLieu },
                soLuong: ct.soLuong
            }))
        };

        try {
            await api.post('/san-pham', payload);
            alert("Lưu dữ liệu thành công!");
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Có lỗi khi lưu sản phẩm!");
        }
    };

    const filteredSanPhams = sanPhams.filter(sp => 
        sp.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sp.maSanPham.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showForm) {
        return (
            <div className="container mt-4">
                <div className="d-flex justify-content-between mb-3">
                    <h2>{isEditing ? `Sửa Sản Phẩm: ${formData.tenSanPham}` : 'Thêm Sản Phẩm Mới'}</h2>
                    <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Quay lại</button>
                </div>

                <div className="row">
                    <div className="col-md-5">
                        <div className="card shadow-sm mb-3">
                            <div className="card-header bg-dark text-white">Thông tin & Hình ảnh</div>
                            <div className="card-body">
                                <div className="mb-3 p-3 bg-light rounded border">
                                    <label className="fw-bold text-primary small">Ảnh Sản Phẩm (Tải lên từ máy)</label>
                                    <div className="mt-1">
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            accept="image/*"
                                            onChange={handleImageUpload} 
                                        />
                                    </div>
                                    <div className="mt-2 text-center" style={{ minHeight: '120px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                                        {formData.duongDanHinh ? (
                                            <img src={formData.duongDanHinh} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                                        ) : (
                                            <span className="text-muted small">Chưa chọn ảnh</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-2">
                                    <label>Mã Sản Phẩm</label>
                                    <input type="text" className="form-control" disabled={isEditing} 
                                        value={formData.maSanPham} onChange={e => setFormData({...formData, maSanPham: e.target.value})} />
                                </div>
                                <div className="mb-2">
                                    <label>Tên Sản Phẩm</label>
                                    <input type="text" className="form-control" 
                                        value={formData.tenSanPham} onChange={e => setFormData({...formData, tenSanPham: e.target.value})} />
                                </div>
                                <div className="mb-2">
                                    <label>Đơn giá (VND)</label>
                                    <input type="number" className="form-control" 
                                        value={formData.donGia} onChange={e => setFormData({...formData, donGia: e.target.value})} />
                                </div>
                                
                                <div className="mb-2">
                                    <label>Trạng thái</label>
                                    <select className="form-select" value={formData.trangThai} onChange={e => setFormData({...formData, trangThai: e.target.value})}>
                                        <option value="Đang bán">Đang bán</option>
                                        <option value="Ngừng bán">Ngừng bán</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-7">
                        <div className="card shadow-sm border-primary">
                            <div className="card-header bg-primary text-white">Xây dựng Công Thức (Từ Kho)</div>
                            <div className="card-body">
                                <div className="d-flex gap-2 mb-3 align-items-end">
                                    <div className="flex-grow-1">
                                        <label className="text-muted small">Chọn Nguyên Liệu từ Kho</label>
                                        <select className="form-select" 
                                            value={nlTempt.maNguyenLieu} onChange={e => setNlTempt({...nlTempt, maNguyenLieu: e.target.value})}>
                                            {khoNguyenLieu.map(nl => (
                                                <option key={nl.maNguyenLieu} value={nl.maNguyenLieu}>{nl.tenNguyenLieu} ({nl.donViTinh})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ width: '120px' }}>
                                        <label className="text-muted small">Số lượng</label>
                                        <input type="number" className="form-control" min="0.1" step="0.1"
                                            value={nlTempt.soLuong} onChange={e => setNlTempt({...nlTempt, soLuong: e.target.value})} />
                                    </div>
                                    <button className="btn btn-warning fw-bold" onClick={themNguyenLieuVaoCongThuc}>+ Thêm</button>
                                </div>

                                <table className="table table-sm table-bordered text-center">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Mã NL</th>
                                            <th>Tên Nguyên Liệu</th>
                                            <th>Lượng cần</th>
                                            <th>Đơn vị</th>
                                            <th>Bỏ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {congThuc.length === 0 ? (
                                            <tr><td colSpan="5" className="text-muted">Chưa có nguyên liệu</td></tr>
                                        ) : (
                                            congThuc.map(ct => (
                                                <tr key={ct.maNguyenLieu}>
                                                    <td>{ct.maNguyenLieu}</td>
                                                    <td className="text-start">{ct.tenNguyenLieu}</td>
                                                    <td className="fw-bold text-danger">{ct.soLuong}</td>
                                                    <td>{ct.donViTinh}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => setCongThuc(congThuc.filter(c => c.maNguyenLieu !== ct.maNguyenLieu))}>X</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="card-footer text-end">
                                <button className="btn btn-lg btn-success" onClick={handleLuuThongTin}>💾 LƯU DỮ LIỆU</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="m-0">Quản lý Sản phẩm</h2>
                <div className="d-flex gap-3">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="🔍 Tìm tên hoặc mã SP..." 
                        style={{ width: '250px' }}
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                    />
                    <button className="btn btn-success fw-bold text-nowrap" onClick={handleAddNew}>+ Thêm Sản Phẩm Mới</button>
                </div>
            </div>
            
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover table-bordered text-center align-middle m-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Ảnh</th>
                                <th>Mã SP</th>
                                <th>Tên Sản Phẩm</th>
                                <th>Loại</th>
                                <th>Đơn giá</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
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