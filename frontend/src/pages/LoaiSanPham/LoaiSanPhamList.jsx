import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Import Component Modal Form vừa tạo ở trên
import LoaiSanPhamForm from '../../components/LoaiSanPham/LoaiSanPhamForm';

export default function LoaiSanPhamList() {
    const [danhSachLoai, setDanhSachLoai] = useState([]);
    
    // State quản lý việc hiển thị Modal
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editData, setEditData] = useState(null);
    
    useEffect(() => { 
        fetchData(); 
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('http://localhost:8087/api/v1/loai-san-pham');
            setDanhSachLoai(res.data);
        } catch (error) {
            console.error("Lỗi lấy dữ liệu:", error);
        }
    };

    const handleOpenModal = (loai = null) => {
        if (loai) {
            setIsEdit(true);
            setEditData(loai); // Lưu data của dòng được chọn để ném vào form
        } else {
            setIsEdit(false);
            setEditData(null); // Truyền null để form tự sinh mã mới
        }
        setShowModal(true);
    };

    const handleDelete = async (id, ten) => {
        if (window.confirm(`CẢNH BÁO: Xóa loại "${ten}" sẽ xóa TẤT CẢ sản phẩm thuộc loại này. Bạn có chắc chắn?`)) {
            try {
                await axios.delete(`http://localhost:8080/api/v1/loai-san-pham/${id}`);
                fetchData();
            } catch (error) {
                console.error("Lỗi khi xóa:", error);
                alert("Không thể xóa do lỗi kết nối hoặc dữ liệu đang được sử dụng!");
            }
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                <h4 className="text-primary fw-bold m-0">QUẢN LÝ LOẠI SẢN PHẨM</h4>
                <button className="btn btn-primary fw-bold shadow-sm" onClick={() => handleOpenModal()}>
                    + Thêm Mới
                </button>
            </div>
            
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover align-middle mb-0 text-center">
                        <thead className="table-dark">
                            <tr>
                                <th>Mã Loại</th>
                                <th>Tên Loại</th>
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {danhSachLoai.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="p-4 text-muted">Chưa có loại sản phẩm nào.</td>
                                </tr>
                            ) : (
                                danhSachLoai.map(loai => (
                                    <tr key={loai.maLoaiSanPham}>
                                        <td className="fw-bold text-secondary">{loai.maLoaiSanPham}</td>
                                        <td className="text-start fw-bold text-primary fs-5">{loai.tenLoaiSanPham}</td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-warning me-2 fw-bold px-3" onClick={() => handleOpenModal(loai)}>
                                                Sửa
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger fw-bold px-3" onClick={() => handleDelete(loai.maLoaiSanPham, loai.tenLoaiSanPham)}>
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gọi Component Form ra khi biến showModal là true */}
            {showModal && (
                <LoaiSanPhamForm 
                    isEdit={isEdit}
                    initialData={editData}
                    onClose={() => setShowModal(false)}
                    onRefresh={fetchData}
                />
            )}
        </div>
    );
}