import React, { useState } from 'react';
import api from '../../api/axiosConfig';

const SanPhamForm = ({ isEditing, initialData, initialCongThuc, khoNguyenLieu, loaiSanPhams, onClose, onRefresh }) => {
    const [formData, setFormData] = useState(initialData || {
        maSanPham: 'SP' + Date.now(), 
        tenSanPham: '', 
        donGia: '', 
        maLoaiSanPham: 'LSP01', 
        trangThai: 'Đang bán', 
        duongDanHinh: ''
    });

    const [congThuc, setCongThuc] = useState(initialCongThuc || []); 
    const [nlTempt, setNlTempt] = useState({ 
        maNguyenLieu: khoNguyenLieu.length > 0 ? khoNguyenLieu[0].maNguyenLieu : '', 
        soLuong: 1 
    });

    // HÀM UPLOAD ẢNH
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        try {
            const response = await api.post('/upload', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, duongDanHinh: response.data }));
        } catch (error) {
            console.error("Lỗi upload:", error);
            alert("Lỗi khi tải ảnh lên máy chủ (Kiểm tra cổng 8080 và Controller)!");
        }
    };

    // THÊM NGUYÊN LIỆU VÀO CÔNG THỨC
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

    // XÓA NGUYÊN LIỆU KHỎI CÔNG THỨC
    const xoaNguyenLieuKhoiCongThuc = (maNguyenLieu) => {
        setCongThuc(congThuc.filter(c => c.maNguyenLieu !== maNguyenLieu));
    };

    // LƯU THÔNG TIN SẢN PHẨM
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
            onRefresh(); // Load lại dữ liệu ở component cha
            onClose();   // Tắt form
        } catch (error) {
            console.error(error);
            alert("Có lỗi khi lưu sản phẩm!");
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-3">
                <h2>{isEditing ? `Sửa Sản Phẩm: ${formData.tenSanPham}` : 'Thêm Sản Phẩm Mới'}</h2>
                <button className="btn btn-secondary" onClick={onClose}>Quay lại</button>
            </div>

            <div className="row">
                <div className="col-md-5">
                    <div className="card shadow-sm mb-3">
                        <div className="card-header bg-dark text-white">Thông tin & Hình ảnh</div>
                        <div className="card-body">
                            <div className="mb-3 p-3 bg-light rounded border">
                                <label className="fw-bold text-primary small">Ảnh Sản Phẩm (Tải lên từ máy)</label>
                                <div className="mt-1">
                                    <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
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
                                <input type="text" className="form-control" disabled value={formData.maSanPham} />
                            </div>
                            <div className="mb-2">
                                <label>Tên Sản Phẩm</label>
                                <input type="text" className="form-control" value={formData.tenSanPham} onChange={e => setFormData({...formData, tenSanPham: e.target.value})} />
                            </div>
                            <div className="mb-2">
                                <label>Đơn giá (VND)</label>
                                <input type="number" className="form-control" value={formData.donGia} onChange={e => setFormData({...formData, donGia: e.target.value})} />
                            </div>
                            <div className="mb-2">
                                <label>Loại sản phẩm</label>
                                <select className="form-select" value={formData.maLoaiSanPham} onChange={e => setFormData({...formData, maLoaiSanPham: e.target.value})}>
                                    {loaiSanPhams.map(loai => (
                                        <option key={loai.maLoaiSanPham} value={loai.maLoaiSanPham}>
                                            {loai.tenLoaiSanPham}
                                        </option>
                                    ))}
                                </select>
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
                                    <select className="form-select" value={nlTempt.maNguyenLieu} onChange={e => setNlTempt({...nlTempt, maNguyenLieu: e.target.value})}>
                                        {khoNguyenLieu.map(nl => (
                                            <option key={nl.maNguyenLieu} value={nl.maNguyenLieu}>{nl.tenNguyenLieu} ({nl.donViTinh})</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ width: '120px' }}>
                                    <label className="text-muted small">Số lượng</label>
                                    <input type="number" className="form-control" min="0.1" step="0.1" value={nlTempt.soLuong} onChange={e => setNlTempt({...nlTempt, soLuong: e.target.value})} />
                                </div>
                                <button className="btn btn-warning fw-bold" onClick={themNguyenLieuVaoCongThuc}>+ Thêm</button>
                            </div>

                            <table className="table table-sm table-bordered text-center">
                                <thead className="table-light">
                                    <tr><th>Mã NL</th><th>Tên Nguyên Liệu</th><th>Lượng cần</th><th>Đơn vị</th><th>Bỏ</th></tr>
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
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => xoaNguyenLieuKhoiCongThuc(ct.maNguyenLieu)}>X</button>
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
};

export default SanPhamForm;