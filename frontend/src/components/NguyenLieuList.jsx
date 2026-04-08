import React, { useState, useEffect } from 'react';
import apiStore from '../api/axiosStore'; // Dùng cấu hình 8081

const NguyenLieuList = () => {
    const [nguyenLieus, setNguyenLieus] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Dữ liệu Form
    const [formData, setFormData] = useState({
        maNguyenLieu: '',
        tenNguyenLieu: '',
        soLuong: '',
        donViTinh: 'Gam'
    });

    // Gọi API khi vừa vào trang
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await apiStore.get('/nguyen-lieu');
            setNguyenLieus(response.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu Kho:", error);
        }
    };

    // Hành động: Bấm nút Thêm
    const handleAddNew = () => {
        setIsEditing(false);
        setFormData({ maNguyenLieu: '', tenNguyenLieu: '', soLuong: '', donViTinh: 'Gam' });
        setShowForm(true);
    };

    // Hành động: Bấm nút Sửa
    const handleEdit = (nl) => {
        setIsEditing(true);
        setFormData({
            maNguyenLieu: nl.maNguyenLieu,
            tenNguyenLieu: nl.tenNguyenLieu,
            soLuong: nl.soLuong,
            donViTinh: nl.donViTinh
        });
        setShowForm(true);
    };

    // Hành động: Bấm nút Xóa
    const handleDelete = async (maNguyenLieu) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa nguyên liệu này khỏi kho?")) {
            try {
                await apiStore.delete(`/nguyen-lieu/${maNguyenLieu}`);
                alert("Xóa thành công!");
                loadData();
            } catch (error) {
                console.error(error);
                alert("Lỗi khi xóa!");
            }
        }
    };

    // Hành động: Bấm nút Lưu (Cho cả Thêm và Sửa)
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // API Post của chúng ta trong Spring Boot có tính năng: Nếu trùng Mã thì Cập nhật, nếu chưa có thì Thêm mới
            await apiStore.post('/nguyen-lieu', formData);
            alert("Lưu thông tin thành công!");
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu dữ liệu!");
        }
    };

    // --- RENDER GIAO DIỆN ---
    if (showForm) {
        return (
            <div className="card shadow-sm mt-4 mx-auto" style={{ maxWidth: '600px' }}>
                <div className="card-header bg-warning text-dark fw-bold">
                    {isEditing ? 'Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu Mới'}
                </div>
                <div className="card-body">
                    <form onSubmit={handleSave}>
                        <div className="mb-3">
                            <label>Mã Nguyên Liệu</label>
                            <input type="text" className="form-control" required
                                disabled={isEditing} // Không cho sửa Mã khi đang Edit
                                value={formData.maNguyenLieu} 
                                onChange={e => setFormData({...formData, maNguyenLieu: e.target.value})} 
                                placeholder="VD: NL06" />
                        </div>
                        <div className="mb-3">
                            <label>Tên Nguyên Liệu</label>
                            <input type="text" className="form-control" required
                                value={formData.tenNguyenLieu} 
                                onChange={e => setFormData({...formData, tenNguyenLieu: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <label>Số Lượng Kho</label>
                            <input type="number" className="form-control" required min="0" step="0.1"
                                value={formData.soLuong} 
                                onChange={e => setFormData({...formData, soLuong: e.target.value})} />
                        </div>
                        <div className="mb-3">
                            <label>Đơn Vị Tính</label>
                            <select className="form-select" 
                                value={formData.donViTinh} 
                                onChange={e => setFormData({...formData, donViTinh: e.target.value})}>
                                <option value="Gam">Gam</option>
                                <option value="Kg">Kg</option>
                                <option value="Ml">Ml</option>
                                <option value="Lít">Lít</option>
                                <option value="Hộp">Hộp</option>
                            </select>
                        </div>
                        <div className="text-end">
                            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowForm(false)}>Hủy</button>
                            <button type="submit" className="btn btn-primary">Lưu Nguyên Liệu</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="text-warning">📦 Quản Lý Kho Nguyên Liệu</h2>
                <button className="btn btn-warning fw-bold" onClick={handleAddNew}>+ Thêm Nguyên Liệu</button>
            </div>
            
            <div className="card shadow-sm">
                <div className="card-body">
                    <table className="table table-hover table-bordered text-center align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Mã NL</th>
                                <th>Tên Nguyên Liệu</th>
                                <th>Tồn Kho</th>
                                <th>Đơn Vị</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nguyenLieus.length === 0 ? (
                                <tr><td colSpan="5">Kho đang trống!</td></tr>
                            ) : (
                                nguyenLieus.map((nl) => (
                                    <tr key={nl.maNguyenLieu}>
                                        <td className="fw-bold">{nl.maNguyenLieu}</td>
                                        <td className="text-start">{nl.tenNguyenLieu}</td>
                                        <td className="text-danger fw-bold fs-5">{nl.soLuong}</td>
                                        <td>{nl.donViTinh}</td>
                                        <td>
                                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(nl)}>Sửa</button>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(nl.maNguyenLieu)}>Xóa</button>
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

export default NguyenLieuList;