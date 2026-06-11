import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react';
import { orderApi, doanhthuApi, tableApi } from '../../api/APIGateway';
import ReceiptModal from '../../components/Common/ReceiptModal';
import './PaymentPage.css';

const PaymentPage = () => {
    const { maBan } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [maNV] = useState(localStorage.getItem('maNhanVien'));
    const [tenNV] = useState(localStorage.getItem('tenNhanVien') || 'Nhân viên');
    const {
        maHoaDon: maHDTuState,
        cart: cartTuState,
        maCa: maCaTuState,
        totalAmount: totalTuState,
        subTotal: subTotalTuState,
        manualDiscount,
        autoDiscount,
        nameTable
    } = location.state || {};

    const [order, setOrder] = useState(null);
    const [maCaOpen, setMaCaOpen] = useState(maCaTuState || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initPage = async () => {
            try {
                setLoading(true);
                // A. Đảm bảo có Mã Ca (Port 8084)
                if (!maCaOpen) {
                    const caRes = await doanhthuApi.getMaCaDangMo();
                    setMaCaOpen(caRes.data.maCa || caRes.data);
                }

                // B. Lấy thông tin Hóa đơn (Port 8081) để đối soát
                const orderRes = await orderApi.loadBan(maBan);
                if (orderRes.data) {
                    setOrder(orderRes.data);
                }
            } catch (err) {
                console.error("Lỗi khởi tạo thanh toán:", err);
            } finally {
                setLoading(false);
            }
        };
        initPage();
    }, [maBan, maCaOpen]);

   const handleConfirmPayment = async (method) => {
            if (!maCaOpen || maCaOpen === 'NONE') {
                alert("⚠️ Không xác định được ca làm việc!");
                return;
            }

            // 1. Lấy dữ liệu thực tế
            let finalAmount = totalTuState || order?.tongTien; 
            const finalSubTotal = subTotalTuState || order?.tongTienGoc || 0;
            const currentCart = cartTuState || order?.items || [];
            let activePromo = manualDiscount || autoDiscount;
            let finalMaKM = activePromo?.maKhuyenMai || null;

            // 2. CHECK NHẸ: Nếu không đủ điều kiện thì "HỦY" phần giảm giá
            if (activePromo && activePromo.configs && activePromo.configs.length > 0) {
                const config = activePromo.configs[0];
                const checkResult = validatePromotion(config, finalSubTotal, currentCart);
                
                if (!checkResult.valid) {
                    // KHÔNG 'return' nữa, chỉ thông báo và reset giá về giá gốc
                    console.warn(`Hủy mã ${activePromo.maKhuyenMai}: ${checkResult.reason}`);
                    finalAmount = finalSubTotal; // Thu đúng giá gốc
                    finalMaKM = null; // Coi như không dùng mã
                }
            }

            try {
                const finalMaHD = maHDTuState || order?.maHoaDon;

                const paymentPayload = {
                    maHoaDon: finalMaHD,
                    maBan: maBan,
                    maCa: maCaOpen,
                    phuongThucThanhToan: method,
                    maKhuyenMai: finalMaKM, // Có thể là null nếu check hụt
                    tongTienSauKM: finalAmount, // Đã được xử lý về giá gốc nếu hụt điều kiện
                    tongTienGoc: finalSubTotal,
                    thoiGianThanhToan: new Date().toISOString(),
                    trangThaiThanhToan: 'Paid',
                    nhanVienThucHien: 'Hải POS',
                    items: currentCart
                };

                await orderApi.finalPayment(paymentPayload);
                await doanhthuApi.updateAfterPayment(maCaOpen, method, finalAmount);
                await tableApi.updateTrangThai(maBan, 'PAID');

                alert(finalMaKM ? "Thanh toán thành công (Đã áp dụng KM)! 🥂" : "Thanh toán thành công giá gốc! 🥂");
                navigate('/sell');
            } catch (err) {
                console.error("Lỗi Payment:", err);
                alert("Lỗi hệ thống: " + (err.response?.data?.message || err.message));
            }
        };
    const validatePromotion = (config, subTotal, cart) => {
        if (subTotal < config.giaTriDonToiThieu) {
            return { valid: false, reason: `Đơn hàng chưa đủ ${config.giaTriDonToiThieu.toLocaleString()}đ` };
        }

        // 2. Kiểm tra Loại món (check theo maLoaiSP)
        if (config.apDungChoMon !== 'ALL') {

            const hasRequiredCategory = cart.some(item => item.maLoaiSP === config.apDungChoMon);
            
            if (!hasRequiredCategory) {
                return { valid: false, reason: `Đơn hàng phải có ít nhất 1 món thuộc loại ${config.apDungChoMon}` };
            }
        }

        return { valid: true };
    };
    if (loading) return (
            <div className="payment-loading-screen">
                <Loader2 className="spin-icon" size={48} />
                <p>Đang chuẩn bị hóa đơn...</p>
            </div>
        );

    if (!order && !maHDTuState && (!cartTuState || cartTuState.length === 0)) {
        return (
            <div className="payment-error-screen">
                <AlertTriangle size={64} color="#ef4444" />
                <h2>Không tìm thấy đơn hàng</h2>
                <p>Bàn này hiện chưa có món nào để thanh toán.</p>
                <button className="btn-back-home" onClick={() => navigate('/sell')}>Quay về Sơ đồ</button>
            </div>
        );
    }

    return (
        <div className="payment-page-wrapper">
            <ReceiptModal 
                isOpen={true} 
                onClose={() => navigate(-1)} 
                nameTable={nameTable || `Bàn ${maBan}`}
                maBan={maBan}
                nameStaff={tenNV}
                cart={cartTuState || order?.items || []}
                subTotal={subTotalTuState || order?.tongTienGoc || 0}
                autoDiscount={autoDiscount}
                autoDiscountVal={subTotalTuState - totalTuState || 0} 
                manualDiscount={manualDiscount}
                totalAmount={totalTuState || order?.tongTien}
                maHoaDon={maHDTuState || order?.maHoaDon}
                onConfirm={handleConfirmPayment} 
            /> 
        </div>
    );
};

export default PaymentPage;
