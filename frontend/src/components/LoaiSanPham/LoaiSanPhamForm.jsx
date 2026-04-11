import React, { useState } from 'react';
import axios from 'axios';

const LoaiSanPhamForm = ({ isEdit, initialData, onClose, onRefresh }) => {
    // Khởi tạo state dựa trên dữ liệu truyền vào (Có sửa thì lấy data cũ, Không sửa thì tạo mã mới)
    const [formData, setFormData] = useState(initialData || { 
        maLoaiSanPham: 'LSP' + Date.now(), 
        tenLoaiSanPham: '' 
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await axios.put(`http://localhost:8087/api/v1/loai-san-pham/${formData.maLoaiSanPham}`, formData);
            } else {
                await axios.post('http://localhost:8087/api/v1/loai-san-pham', formData);
            }
            onRefresh(); // Gọi hàm load lại bảng của component cha
            onClose();   // Đóng Modal
        } catch (error) {
            console.error("Lỗi khi lưu loại sản phẩm:", error);
            alert("Đã xảy ra lỗi khi lưu!");
        }
    };
    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content shadow">
                    <form onSubmit={handleSubmit}>
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title fw-bold">{isEdit ? 'Sửa Loại Sản Phẩm' : 'Thêm Loại Sản Phẩm Mới'}</h5>
                            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                        </div>
                        <div className="modal-body p-4">
                            <div className="mb-3">
                                <label className="form-label fw-bold">Mã Loại</label>
                                <input type="text" className="form-control bg-light" value={formData.maLoaiSanPham} disabled />
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-bold">Tên Loại</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="Ví dụ: Cà phê, Trà sữa..."
                                    value={formData.tenLoaiSanPham} 
                                    onChange={e => setFormData({...formData, tenLoaiSanPham: e.target.value})} 
                                    required 
                                />
                            </div>
                        </div>
                        <div className="modal-footer bg-light">
                            <button type="button" className="btn btn-secondary" onClick={onClose}>Hủy bỏ</button>
                            <button type="submit" className="btn btn-primary fw-bold px-4">Lưu Dữ Liệu</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoaiSanPhamForm;