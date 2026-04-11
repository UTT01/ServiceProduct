import React, { useState, useEffect } from 'react';
import apiStore from '../api/axiosStore';
import axios from 'axios';

const NguyenLieuList = () => {
    const [nguyenLieus, setNguyenLieus] = useState([]);
    
    // Quản lý trạng thái hiện form
    const [showForm, setShowForm] = useState(false); 
    const [showBaoKhoForm, setShowBaoKhoForm] = useState(false); 
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        maNguyenLieu: '',
        tenNguyenLieu: '',
        soLuong: 0,
        donViTinh: 'Gam',
        nguongCanhBao: 10 
    });

    // ----- STATE CHO FORM BÁO KHO -----
    const [baoKhoItems, setBaoKhoItems] = useState([]); // Chứa danh sách SP đã tick chọn
    const [searchTerm, setSearchTerm] = useState(''); // Ô tìm kiếm trong list box

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

    const getSortedData = () => {
        return [...nguyenLieus].sort((a, b) => {
            const aLow = a.soLuong <= (a.nguongCanhBao ?? 10);
            const bLow = b.soLuong <= (b.nguongCanhBao ?? 10);
            if (aLow && !bLow) return -1;
            if (!aLow && bLow) return 1;
            return 0;
        });
    };

    // Lọc danh sách nguyên liệu theo ô search (cho Form Báo Kho)
    const filteredNguyenLieus = nguyenLieus.filter(nl => 
        nl.tenNguyenLieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nl.maNguyenLieu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddNew = () => {
        setIsEditing(false);
        setFormData({ maNguyenLieu: 'NL' + Date.now(), tenNguyenLieu: '', soLuong: 0, donViTinh: 'Gam', nguongCanhBao: 10 });
        setShowForm(true);
        setShowBaoKhoForm(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await apiStore.post('/nguyen-lieu', formData);
            alert("Lưu thông tin thành công!");
            setShowForm(false);
            loadData();
        } catch (error) {
            console.error(error);
            alert("Lỗi khi lưu dữ liệu!");
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
        setFormData({ ...nl, nguongCanhBao: nl.nguongCanhBao ?? 10 });
        setShowForm(true);
        setShowBaoKhoForm(false);
    };

    // ----- CÁC HÀM XỬ LÝ BÁO KHO MỚI -----
    const openBaoKhoForm = () => {
        setBaoKhoItems([]); 
        setSearchTerm('');
        setShowBaoKhoForm(true);
        setShowForm(false);
    };

    // Xử lý khi tick/bỏ tick một nguyên liệu
    const handleToggleBaoKhoItem = (nl) => {
        const isSelected = baoKhoItems.some(item => item.maNguyenLieu === nl.maNguyenLieu);
        if (isSelected) {
            // Bỏ tick -> Xóa khỏi mảng
            setBaoKhoItems(baoKhoItems.filter(item => item.maNguyenLieu !== nl.maNguyenLieu));
        } else {
            // Tick -> Thêm vào mảng (Mặc định lý do là số lượng hiện tại)
            setBaoKhoItems([...baoKhoItems, { 
                maNguyenLieu: nl.maNguyenLieu, 
                tenNguyenLieu: nl.tenNguyenLieu, 
                noiDung: `Tồn kho hiện tại: ${nl.soLuong} ${nl.donViTinh}` // Mặc định lý do
            }]);
        }
    };

    // Nút "Chọn tất cả" theo kết quả tìm kiếm
    const handleSelectAll = () => {
        if (baoKhoItems.length === filteredNguyenLieus.length && filteredNguyenLieus.length > 0) {
            // Đã chọn hết rồi thì bỏ chọn hết
            setBaoKhoItems([]);
        } else {
            // Chọn toàn bộ list đang hiển thị
            const allItems = filteredNguyenLieus.map(nl => ({
                maNguyenLieu: nl.maNguyenLieu,
                tenNguyenLieu: nl.tenNguyenLieu,
                noiDung: `Tồn kho hiện tại: ${nl.soLuong} ${nl.donViTinh}`
            }));
            setBaoKhoItems(allItems);
        }
    };

    // Sửa trực tiếp "Lý do" dưới bảng
    const handleChangeReason = (maNguyenLieu, newReason) => {
        setBaoKhoItems(baoKhoItems.map(item => 
            item.maNguyenLieu === maNguyenLieu ? { ...item, noiDung: newReason } : item
        ));
    };

    // 🚀 GỬI BÁO KHO SANG NOTIFICATION SERVICE
    const handleSubmitAllBaoKho = async () => {
        if (baoKhoItems.length === 0) return;
        
        try {
            // ---------------------------------------------------------
            // CÁCH MỚI: LẤY DANH SÁCH QUẢN LÝ TỰ ĐỘNG TỪ SERVICE USER
            // ---------------------------------------------------------
            
            // 1. Gọi API sang cổng 8086 (ServiceUser) để lấy toàn bộ nhân viên
            const responseUser = await axios.get('http://localhost:8086/api/nhan-vien'); 
            const tatCaNhanVien = responseUser.data;
            
            // 2. Lọc ra mảng chỉ chứa các mã bắt đầu bằng chữ "QL"
            const danhSachQuanLy = tatCaNhanVien
                .map(nv => nv.maNhanVien) // Lấy ra cái mã
                .filter(ma => ma.startsWith('QL')); // Lọc những mã bắt đầu bằng QL
                
            // (Nếu log ra, mảng danhSachQuanLy lúc này sẽ tự động có dạng ['QL001', 'QL002'...])
            // ---------------------------------------------------------

            const NOTIFICATION_API_URL = 'http://localhost:8082/api/notifications/create';
            const promises = [];

            // Vòng lặp gửi thông báo giữ nguyên như cũ
            baoKhoItems.forEach(item => {
                danhSachQuanLy.forEach(maQL => {
                    promises.push(axios.post(NOTIFICATION_API_URL, { 
                        maNhanVien: maQL, 
                        tieuDe: `Báo cáo nguyên liệu`,
                        noiDung: `Nguyên liệu: ${item.tenNguyenLieu} - ${item.noiDung}`,
                        loaiThongBao: 'KHO',
                        idThamChieu: item.maNguyenLieu 
                    }));
                });
            });

            await Promise.all(promises);
            
            alert(`Đã gửi báo cáo tự động tới ${danhSachQuanLy.length} Quản lý thành công!`);
            setBaoKhoItems([]); 
            setShowBaoKhoForm(false); 
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Đã xảy ra lỗi kết nối!");
        }
    };

    // ---------- GIAO DIỆN FORM BÁO KHO ----------
    if (showBaoKhoForm) {
        return (
            <div className="card shadow mt-4 mx-auto border-warning" style={{ maxWidth: '1000px' }}>
                <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
                    <span>🔔 Tạo Báo Cáo Nguyên Liệu</span>
                    <span className="badge bg-danger fs-6">Đã chọn: {baoKhoItems.length}</span>
                </div>
                <div className="card-body">
                    <div className="row">
                        {/* CỘT TRÁI: KHU VỰC TÌM KIẾM VÀ LIST BOX */}
                        <div className="col-md-5 border-end pe-4">
                            <h5 className="fw-bold mb-3">1. Chọn nguyên liệu</h5>
                            
                            {/* Ô tìm kiếm */}
                            <input 
                                type="text" 
                                className="form-control mb-3" 
                                placeholder="🔍 Tìm tên hoặc mã nguyên liệu..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Nút chọn tất cả */}
                            <div className="form-check mb-2 pb-2 border-bottom">
                                <input 
                                    className="form-check-input" 
                                    type="checkbox" 
                                    id="selectAll"
                                    checked={baoKhoItems.length === filteredNguyenLieus.length && filteredNguyenLieus.length > 0}
                                    onChange={handleSelectAll}
                                />
                                <label className="form-check-label fw-bold text-primary" htmlFor="selectAll" style={{cursor: 'pointer'}}>
                                    Chọn tất cả trong danh sách
                                </label>
                            </div>

                            {/* List Box (Có thanh cuộn) */}
                            <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {filteredNguyenLieus.length === 0 ? (
                                    <div className="text-center text-muted p-3">Không tìm thấy nguyên liệu nào!</div>
                                ) : (
                                    filteredNguyenLieus.map(nl => {
                                        const isLow = nl.soLuong <= (nl.nguongCanhBao ?? 10);
                                        const isChecked = baoKhoItems.some(item => item.maNguyenLieu === nl.maNguyenLieu);
                                        return (
                                            <label key={nl.maNguyenLieu} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isChecked ? 'list-group-item-warning' : ''}`} style={{cursor: 'pointer'}}>
                                                <div className="d-flex align-items-center">
                                                    <input 
                                                        className="form-check-input me-3 mt-0" 
                                                        type="checkbox" 
                                                        checked={isChecked}
                                                        onChange={() => handleToggleBaoKhoItem(nl)}
                                                    />
                                                    <div>
                                                        <div className="fw-bold">{nl.tenNguyenLieu}</div>
                                                        <small className={`text-muted ${isLow ? 'text-danger fw-bold' : ''}`}>
                                                            Tồn: {nl.soLuong} {nl.donViTinh}
                                                        </small>
                                                    </div>
                                                </div>
                                            </label>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* CỘT PHẢI: BẢNG CÁC NGUYÊN LIỆU ĐÃ CHỌN ĐỂ GỬI */}
                        <div className="col-md-7 ps-4">
                            <h5 className="fw-bold mb-3">2. Chi tiết báo cáo</h5>
                            
                            {baoKhoItems.length === 0 ? (
                                <div className="text-center p-5 text-muted border rounded" style={{borderStyle: 'dashed !important', backgroundColor: '#f8f9fa'}}>
                                    <i>Chưa có nguyên liệu nào được chọn.<br/>Hãy tick chọn bên trái.</i>
                                </div>
                            ) : (
                                <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    <table className="table table-bordered table-hover align-middle">
                                        <thead className="table-secondary text-center sticky-top">
                                            <tr>
                                                <th style={{width: '10%'}}>STT</th>
                                                <th style={{width: '40%'}}>Tên Nguyên Liệu</th>
                                                <th style={{width: '50%'}}>Lý do báo cáo</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {baoKhoItems.map((item, index) => (
                                                <tr key={item.maNguyenLieu}>
                                                    <td className="text-center fw-bold text-muted">{index + 1}</td>
                                                    <td className="fw-bold text-primary">{item.tenNguyenLieu}</td>
                                                    <td>
                                                        {/* Cho phép người dùng gõ sửa lại lý do nếu muốn */}
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-sm" 
                                                            value={item.noiDung}
                                                            onChange={(e) => handleChangeReason(item.maNguyenLieu, e.target.value)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-end mt-4 pt-3 border-top">
                        <button type="button" className="btn btn-secondary me-2" onClick={() => setShowBaoKhoForm(false)}>
                            Quay lại
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-warning fw-bold px-5" 
                            onClick={handleSubmitAllBaoKho}
                            disabled={baoKhoItems.length === 0}
                        >
                            🚀 Gửi Báo Cáo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ---------- GIAO DIỆN FORM THÊM/SỬA ----------
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
                                <input type="text" className="form-control" required disabled value={formData.maNguyenLieu} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label>Tên Nguyên Liệu</label>
                                <input type="text" className="form-control" required value={formData.tenNguyenLieu} onChange={e => setFormData({...formData, tenNguyenLieu: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label>Số Lượng</label>
                                <input type="number" className="form-control" required step="0.1" value={formData.soLuong} onChange={e => setFormData({...formData, soLuong: e.target.value})} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <label>Đơn Vị</label>
                                <select className="form-select" value={formData.donViTinh} onChange={e => setFormData({...formData, donViTinh: e.target.value})}>
                                    <option value="Gam">Gam</option><option value="Kg">Kg</option>
                                    <option value="Ml">Ml</option><option value="Lít">Lít</option>
                                </select>
                            </div>
                            <div className="col-md-4 mb-3">
                                <label className="text-danger fw-bold">Ngưỡng cảnh báo</label>
                                <input type="number" className="form-control border-danger" value={formData.nguongCanhBao} onChange={e => setFormData({...formData, nguongCanhBao: e.target.value})} />
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

    // ---------- GIAO DIỆN BẢNG CHÍNH ----------
    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between mb-3 align-items-center">
                <h2 className="text-primary m-0">📦 Quản Lý Kho</h2>
                <div>
                    <button className="btn btn-warning fw-bold me-2" onClick={openBaoKhoForm}>
                        🔔 Báo Cáo Nguyên Liệu
                    </button>
                    <button className="btn btn-success fw-bold" onClick={handleAddNew}>
                        + Nhập Kho
                    </button>
                </div>
            </div>
            
            <table className="table table-hover table-bordered align-middle shadow-sm">
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