import React, { useState, useEffect } from 'react';
import apiStore from '../api/axiosStore';

const NguyenLieuList = () => {
    const [nguyenLieus, setNguyenLieus] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        maNguyenLieu: '',
        tenNguyenLieu: '',
        soLuong: 0,
        donViTinh: 'Gam',
        nguongCanhBao: 10 // Ngưỡng mặc định
    });

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

    // Logic Sắp xếp: Ưu tiên nguyên liệu có (soLuong <= nguongCanhBao) lên đầu
    const getSortedData = () => {
        return [...nguyenLieus].sort((a, b) => {
            const aLow = a.soLuong <= (a.nguongCanhBao ?? 10);
            const bLow = b.soLuong <= (b.nguongCanhBao ?? 10);
            if (aLow && !bLow) return -1;
            if (!aLow && bLow) return 1;
            return 0;
        });
    };

    // Hàm thêm mới sinh mã tự động
    const handleAddNew = () => {
        setIsEditing(false);
        setFormData({
            maNguyenLieu: 'NL' + Date.now(),
            tenNguyenLieu: '',
            soLuong: 0,
            donViTinh: 'Gam',
            nguongCanhBao: 10
        });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            // Spring Boot JpaRepository.save() sẽ Update nếu maNguyenLieu đã tồn tại
            await apiStore.post('/nguyen-lieu', formData);
            alert("Lưu thông tin thành công!");
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu dữ liệu! Hãy đảm bảo Backend đã có @PostMapping");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa nguyên liệu này khỏi kho?")) {
            try {
                await apiStore.delete(`/nguyen-lieu/${id}`);
                loadData();
            } catch (error) {
                alert("Lỗi khi xóa!");
            }
        }
    };

    const openEditForm = (nl) => {
        setIsEditing(true);
        setFormData({
            ...nl,
            nguongCanhBao: nl.nguongCanhBao ?? 10 // Tránh lỗi undefined cho input
        });
        setShowForm(true);
    };

    if (showForm) {
        return (
            <div className="card shadow mt-4 mx-auto" style={{ maxWidth: '700px' }}>
                <div className="card-header bg-primary text-white fw-bold">
                    {isEditing ? 'Sửa Nguyên Liệu' : 'Thêm Nguyên Liệu Mới'}
                </div>
                <div className="card-body">
                    <form onSubmit={handleSave}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Mã Nguyên Liệu</label>
                                <input type="text" className="form-control" required
                                    disabled // Đã khóa ô nhập mã
                                    value={formData.maNguyenLieu || ''} 
                                    onChange={e => setFormData({...formData, maNguyenLieu: e.target.value})} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label>Tên Nguyên Liệu</label>
                                <input type="text" className="form-control" required
                                    value={formData.tenNguyenLieu || ''} 
                                    onChange={e => setFormData({...formData, tenNguyenLieu: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label>Số Lượng</label>
                                <input type="number" className="form-control" required step="0.1"
                                    value={formData.soLuong ?? 0} 
                                    onChange={e => setFormData({...formData, soLuong: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label>Đơn Vị</label>
                                <select className="form-select" value={formData.donViTinh || 'Gam'} 
                                    onChange={e => setFormData({...formData, donViTinh: e.target.value})}>
                                    <option value="Gam">Gam</option><option value="Kg">Kg</option>
                                    <option value="Ml">Ml</option><option value="Lít">Lít</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="text-danger fw-bold">Ngưỡng cảnh báo</label>
                                <input type="number" className="form-control border-danger" 
                                    value={formData.nguongCanhBao ?? 10} 
                                    onChange={e => setFormData({...formData, nguongCanhBao: e.target.value})} />
                            </div>
                        </div>
                        <div className="text-end mt-3">
                            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowForm(false)}>Hủy</button>
                            <button type="submit" className="btn btn-primary">Lưu dữ liệu</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between mb-3">
                <h2 className="text-primary">📦 Quản Lý Kho</h2>
                <button className="btn btn-success" onClick={handleAddNew}>+ Nhập Kho</button>
            </div>
            
            <table className="table table-hover table-bordered align-middle">
                <thead className="table-dark text-center">
                    <tr>
                        <th>Mã</th><th>Tên</th><th>Tồn Kho</th><th>Đơn Vị</th><th>Ngưỡng</th><th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {getSortedData().map((nl) => {
                        const isLow = nl.soLuong <= (nl.nguongCanhBao ?? 10);
                        return (
                            <tr key={nl.maNguyenLieu} className={isLow ? "table-danger" : ""}>
                                <td className="text-center fw-bold">{nl.maNguyenLieu}</td>
                                <td>
                                    {nl.tenNguyenLieu} 
                                    {isLow && <span className="badge bg-danger ms-2">Sắp hết!</span>}
                                </td>
                                <td className={`text-center fw-bold ${isLow ? 'text-danger' : ''}`}>{nl.soLuong}</td>
                                <td className="text-center">{nl.donViTinh}</td>
                                <td className="text-center text-muted">{nl.nguongCanhBao ?? 10}</td>
                                <td className="text-center">
                                    <button className="btn btn-sm btn-info me-2" onClick={() => openEditForm(nl)}>Sửa</button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(nl.maNguyenLieu)}>Xóa</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default NguyenLieuList;