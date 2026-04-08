import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LoaiSanPhamList() {
    const [danhSachLoai, setDanhSachLoai] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({ maLoaiSanPham: '', tenLoaiSanPham: '' });
    
    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        const res = await axios.get('http://localhost:8080/api/v1/loai-san-pham');
        setDanhSachLoai(res.data);
    };

    const handleOpenModal = (loai = null) => {
        if (loai) {
            setIsEdit(true);
            setFormData(loai);
        } else {
            setIsEdit(false);
            setFormData({ maLoaiSanPham: 'LSP' + Date.now(), tenLoaiSanPham: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEdit) {
            await axios.put(`http://localhost:8080/api/v1/loai-san-pham/${formData.maLoaiSanPham}`, formData);
        } else {
            await axios.post('http://localhost:8080/api/v1/loai-san-pham', formData);
        }
        setShowModal(false);
        fetchData();
    };

    const handleDelete = async (id, ten) => {
        if (window.confirm(`CẢNH BÁO: Xóa loại "${ten}" sẽ xóa TẤT CẢ sản phẩm thuộc loại này. Bạn có chắc chắn?`)) {
            await axios.delete(`http://localhost:8080/api/v1/loai-san-pham/${id}`);
            fetchData();
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-3">
                <h4 className="text-primary fw-bold">QUẢN LÝ LOẠI SẢN PHẨM</h4>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>+ Thêm Mới</button>
            </div>
            <table className="table table-hover shadow-sm">
                <thead className="table-light">
                    <tr>
                        <th>Mã Loại</th>
                        <th>Tên Loại</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {danhSachLoai.map(loai => (
                        <tr key={loai.maLoaiSanPham}>
                            <td>{loai.maLoaiSanPham}</td>
                            <td>{loai.tenLoaiSanPham}</td>
                            <td>
                                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleOpenModal(loai)}>Sửa</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(loai.maLoaiSanPham, loai.tenLoaiSanPham)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">{isEdit ? 'Sửa Loại' : 'Thêm Loại'}</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Mã Loại</label>
                                        <input type="text" className="form-control" value={formData.maLoaiSanPham} disabled />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Tên Loại</label>
                                        <input type="text" className="form-control" value={formData.tenLoaiSanPham} onChange={e => setFormData({...formData, tenLoaiSanPham: e.target.value})} required />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Lưu</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}