import React, { useState } from 'react';
import apiStore from '../../api/axiosStore';

const NguyenLieuForm = ({ isEditing, initialData, onClose, onRefresh }) => {
    // Quản lý state của riêng form này
    const [formData, setFormData] = useState(initialData || {
        maNguyenLieu: 'NL' + Date.now(),
        tenNguyenLieu: '',
        soLuong: 0,
        donViTinh: 'Gam',
        nguongCanhBao: 10
    });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await apiStore.post('/nguyen-lieu', formData);
            alert("Lưu thông tin thành công!");
            onRefresh(); // Gọi hàm load lại bảng của component cha
            onClose();   // Đóng form
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu dữ liệu!");
        }
    };

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
                            <input type="text" className="form-control" required disabled value={formData.maNguyenLieu} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Tên Nguyên Liệu</label>
                            <input type="text" className="form-control" required value={formData.tenNguyenLieu} onChange={e => setFormData({ ...formData, tenNguyenLieu: e.target.value })} />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label>Số Lượng</label>
                            <input type="number" className="form-control" required step="0.1" value={formData.soLuong} onChange={e => setFormData({ ...formData, soLuong: e.target.value })} />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label>Đơn Vị</label>
                            <select className="form-select" value={formData.donViTinh} onChange={e => setFormData({ ...formData, donViTinh: e.target.value })}>
                                <option value="Gam">Gam</option><option value="Kg">Kg</option>
                                <option value="Ml">Ml</option><option value="Lít">Lít</option>
                            </select>
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="text-danger fw-bold">Ngưỡng cảnh báo</label>
                            <input type="number" className="form-control border-danger" value={formData.nguongCanhBao} onChange={e => setFormData({ ...formData, nguongCanhBao: e.target.value })} />
                        </div>
                    </div>
                    <div className="text-end mt-3">
                        <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn btn-primary">Lưu dữ liệu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NguyenLieuForm;