import React, { useState } from 'react';
import axios from 'axios';

const BaoKhoForm = ({ nguyenLieus, onClose }) => {
    const [baoKhoItems, setBaoKhoItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredNguyenLieus = nguyenLieus.filter(nl =>
        nl.tenNguyenLieu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nl.maNguyenLieu.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleBaoKhoItem = (nl) => {
        const isSelected = baoKhoItems.some(item => item.maNguyenLieu === nl.maNguyenLieu);
        if (isSelected) {
            setBaoKhoItems(baoKhoItems.filter(item => item.maNguyenLieu !== nl.maNguyenLieu));
        } else {
            setBaoKhoItems([...baoKhoItems, {
                maNguyenLieu: nl.maNguyenLieu,
                tenNguyenLieu: nl.tenNguyenLieu,
                noiDung: `Tồn kho hiện tại: ${nl.soLuong} ${nl.donViTinh}`
            }]);
        }
    };

    const handleSelectAll = () => {
        if (baoKhoItems.length === filteredNguyenLieus.length && filteredNguyenLieus.length > 0) {
            setBaoKhoItems([]);
        } else {
            const allItems = filteredNguyenLieus.map(nl => ({
                maNguyenLieu: nl.maNguyenLieu,
                tenNguyenLieu: nl.tenNguyenLieu,
                noiDung: `Tồn kho hiện tại: ${nl.soLuong} ${nl.donViTinh}`
            }));
            setBaoKhoItems(allItems);
        }
    };

    const handleChangeReason = (maNguyenLieu, newReason) => {
        setBaoKhoItems(baoKhoItems.map(item =>
            item.maNguyenLieu === maNguyenLieu ? { ...item, noiDung: newReason } : item
        ));
    };

    const handleSubmitAllBaoKho = async () => {
        if (baoKhoItems.length === 0) return;

        try {
            const responseUser = await axios.get('http://localhost:8086/api/nhan-vien');
            const danhSachQuanLy = responseUser.data
                .map(nv => nv.maNhanVien)
                .filter(ma => ma.startsWith('QL'));

            if (danhSachQuanLy.length === 0) {
                alert("Không tìm thấy Quản lý nào trong hệ thống để gửi báo cáo!");
                return;
            }

            const noiDungGop = baoKhoItems.map((item) => `- ${item.tenNguyenLieu}: ${item.noiDung}`).join('\n');
            const NOTIFICATION_API_URL = 'http://localhost:8089/api/notifications/create';
            const promises = [];

            danhSachQuanLy.forEach(maQL => {
                promises.push(axios.post(NOTIFICATION_API_URL, {
                    maNhanVien: maQL,
                    tieuDe: `Báo cáo kho (${baoKhoItems.length} nguyên liệu)`,
                    noiDung: noiDungGop,
                    loaiThongBao: 'KHO',
                    idThamChieu: null
                }));
            });

            await Promise.all(promises);

            alert(`Đã gửi báo cáo tự động tới ${danhSachQuanLy.length} Quản lý thành công!`);
            setBaoKhoItems([]);
            onClose(); // Đóng form báo kho
        } catch (error) {
            console.error("Lỗi:", error);
            alert("Đã xảy ra lỗi kết nối! Hãy chắc chắn ServiceUser (8086) và Notification (8089) đang chạy.");
        }
    };

    return (
        <div className="card shadow mt-4 mx-auto border-warning" style={{ maxWidth: '1000px' }}>
            <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center">
                <span>🔔 Tạo Báo Cáo Nguyên Liệu</span>
                <span className="badge bg-danger fs-6">Đã chọn: {baoKhoItems.length}</span>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-5 border-end pe-4">
                        <h5 className="fw-bold mb-3">1. Chọn nguyên liệu</h5>
                        <input type="text" className="form-control mb-3" placeholder="🔍 Tìm tên hoặc mã..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        
                        <div className="form-check mb-2 pb-2 border-bottom">
                            <input className="form-check-input" type="checkbox" id="selectAll" checked={baoKhoItems.length === filteredNguyenLieus.length && filteredNguyenLieus.length > 0} onChange={handleSelectAll} />
                            <label className="form-check-label fw-bold text-primary" htmlFor="selectAll" style={{ cursor: 'pointer' }}>Chọn tất cả trong danh sách</label>
                        </div>

                        <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {filteredNguyenLieus.length === 0 ? (
                                <div className="text-center text-muted p-3">Không tìm thấy nguyên liệu nào!</div>
                            ) : (
                                filteredNguyenLieus.map(nl => {
                                    const isLow = nl.soLuong <= (nl.nguongCanhBao ?? 10);
                                    const isChecked = baoKhoItems.some(item => item.maNguyenLieu === nl.maNguyenLieu);
                                    return (
                                        <label key={nl.maNguyenLieu} className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${isChecked ? 'list-group-item-warning' : ''}`} style={{ cursor: 'pointer' }}>
                                            <div className="d-flex align-items-center">
                                                <input className="form-check-input me-3 mt-0" type="checkbox" checked={isChecked} onChange={() => handleToggleBaoKhoItem(nl)} />
                                                <div>
                                                    <div className="fw-bold">{nl.tenNguyenLieu}</div>
                                                    <small className={`text-muted ${isLow ? 'text-danger fw-bold' : ''}`}>Tồn: {nl.soLuong} {nl.donViTinh}</small>
                                                </div>
                                            </div>
                                        </label>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    <div className="col-md-7 ps-4">
                        <h5 className="fw-bold mb-3">2. Chi tiết báo cáo</h5>
                        {baoKhoItems.length === 0 ? (
                            <div className="text-center p-5 text-muted border rounded" style={{ borderStyle: 'dashed !important', backgroundColor: '#f8f9fa' }}>
                                <i>Chưa có nguyên liệu nào được chọn.<br />Hãy tick chọn bên trái.</i>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                <table className="table table-bordered table-hover align-middle">
                                    <thead className="table-secondary text-center sticky-top">
                                        <tr><th style={{ width: '10%' }}>STT</th><th style={{ width: '40%' }}>Tên Nguyên Liệu</th><th style={{ width: '50%' }}>Lý do báo cáo</th></tr>
                                    </thead>
                                    <tbody>
                                        {baoKhoItems.map((item, index) => (
                                            <tr key={item.maNguyenLieu}>
                                                <td className="text-center fw-bold text-muted">{index + 1}</td>
                                                <td className="fw-bold text-primary">{item.tenNguyenLieu}</td>
                                                <td><input type="text" className="form-control form-control-sm" value={item.noiDung} onChange={(e) => handleChangeReason(item.maNguyenLieu, e.target.value)} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-end mt-4 pt-3 border-top">
                    <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Quay lại</button>
                    <button type="button" className="btn btn-warning fw-bold px-5" onClick={handleSubmitAllBaoKho} disabled={baoKhoItems.length === 0}>🚀 Gửi Báo Cáo</button>
                </div>
            </div>
        </div>
    );
};

export default BaoKhoForm;