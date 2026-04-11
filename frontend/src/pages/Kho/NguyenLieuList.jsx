import React, { useState, useEffect } from 'react';
import apiStore from '../../api/axiosStore';
import NguyenLieuForm from '../../components/Kho/NguyenLieuForm';
import BaoKhoForm from '../../components/Kho/BaoKhoForm';

const NguyenLieuList = () => {
    const [nguyenLieus, setNguyenLieus] = useState([]);
    
    // Quản lý việc đang xem màn hình nào: 'LIST', 'FORM', 'BAO_KHO'
    const [currentView, setCurrentView] = useState('LIST'); 
    
    // Lưu tạm data khi muốn sửa
    const [editData, setEditData] = useState(null);

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

    const getSortedData = () => {
        return [...nguyenLieus].sort((a, b) => {
            const aLow = a.soLuong <= (a.nguongCanhBao ?? 10);
            const bLow = b.soLuong <= (b.nguongCanhBao ?? 10);
            if (aLow && !bLow) return -1;
            if (!aLow && bLow) return 1;
            return 0;
        });
    };

    // Điều hướng form
    if (currentView === 'BAO_KHO') {
        return <BaoKhoForm nguyenLieus={nguyenLieus} onClose={() => setCurrentView('LIST')} />;
    }

    if (currentView === 'FORM') {
        return <NguyenLieuForm 
            isEditing={!!editData} 
            initialData={editData} 
            onRefresh={loadData} 
            onClose={() => setCurrentView('LIST')} 
        />;
    }

    // Mặc định là hiển thị Bảng (LIST)
    return (
        <div className="mt-4">
            <div className="d-flex justify-content-between mb-3 align-items-center">
                <h2 className="text-primary m-0">📦 Quản Lý Kho</h2>
                <div>
                    <button className="btn btn-warning fw-bold me-2" onClick={() => setCurrentView('BAO_KHO')}>
                        🔔 Báo Cáo Nguyên Liệu
                    </button>
                    <button className="btn btn-success fw-bold" onClick={() => { setEditData(null); setCurrentView('FORM'); }}>
                        + Nhập Kho
                    </button>
                </div>
            </div>
            
            <table className="table table-hover table-bordered align-middle shadow-sm">
                <thead className="table-dark text-center">
                    <tr><th>Mã</th><th>Tên</th><th>Tồn Kho</th><th>Đơn Vị</th><th>Ngưỡng</th><th>Thao tác</th></tr>
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
                                    <button className="btn btn-sm btn-info me-2" onClick={() => { setEditData(nl); setCurrentView('FORM'); }}>Sửa</button>
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