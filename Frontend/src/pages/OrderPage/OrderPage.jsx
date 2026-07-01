import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Info, MoreVertical, X } from 'lucide-react';
import { orderApi, promoApi, tableApi, doanhthuApi, productApi } from '../../api/APIGateway'; 
import PhanLoaiCard from '../../components/Common/PhanLoaiCard'; 
import CategoryTab from '../../components/Common/CategoryTab';
import KitchenSlipModal from '../../components/Common/KitchenSlipModal';
import CartFooter from '../../components/Common/CartFooter';
import PromotionModal from '../../components/Common/PromotionModal';
import NoteModal from '../../components/Common/NoteModal';
import CartList from '../../components/Common/CartList';
import OrderDropdown from '../../components/Common/OrderDropdown';
import ConfirmDeleteModal from '../../components/Common/ConfirmDeleteModal';
import * as CartHelpers from '../../utils/cartHelpers';
import './orderPage.css';
const OrderPage = () => {
    const { maBan } = useParams();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [allPromos, setAllPromos] = useState([]);
    const [maHoaDon, setMaHoaDon] = useState(null);
    const [maCaOpen, setMaCaOpen] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
    const [isKitchenSlipOpen, setIsKitchenSlipOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingIdx, setEditingIdx] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, index: null, item: null });
    const [itemsToPrint, setItemsToPrint] = useState([]);
    const [nameTable, setNameTable] = useState('');

    const [autoDiscount, setAutoDiscount] = useState(null);
    const [manualDiscount, setManualDiscount] = useState(null);
    const [originalCart, setOriginalCart] = useState([]);
    const [categories, setCategories] = useState([{ id: 'ALL', name: 'Tất cả' }]);
    const validatePromoValid = (promo, currentSubTotal, currentCart) => {
    if (!promo || !promo.configs || promo.configs.length === 0) return false;
    
    const config = promo.configs[0];

    // 1. Check số tiền tối thiểu
    if (currentSubTotal < config.giaTriDonToiThieu) return false;

    // 2. Check loại món (nếu có yêu cầu cụ thể)
    if (config.apDungChoMon !== 'ALL') {
        const hasCategory = currentCart.some(item => item.loai === config.apDungChoMon);
        if (!hasCategory) return false;
    }

    return true;
};
    // Khuyen mai
    const subTotal = React.useMemo(() => 
        CartHelpers.calculateSubTotal(cart), [cart]);

    // 1. Tính giảm giá tự động (Hệ thống)
    const autoDiscountVal = React.useMemo(() => {
        // Nếu không thỏa mãn điều kiện (ví dụ chưa đủ 150k) -> Trả về 0đ giảm giá
        if (!validatePromoValid(autoDiscount, subTotal, cart)) return 0;
        
        return CartHelpers.calculateDiscountValue(autoDiscount, subTotal);
    }, [autoDiscount, subTotal, cart]); // Thêm cart vào đây

    // 2. Tính giảm giá chọn tay (Nhân viên chọn)
    const manualDiscountVal = React.useMemo(() => {
        // Tương tự, nếu nhân viên chọn mã mà đơn chưa đủ tiền -> Cũng trả về 0đ
        if (!validatePromoValid(manualDiscount, subTotal, cart)) return 0;

        return CartHelpers.calculateDiscountValue(manualDiscount, subTotal);
    }, [manualDiscount, subTotal, cart]);

    const totalAmount = React.useMemo(() => 
        CartHelpers.calculateFinalTotal(subTotal, autoDiscountVal, manualDiscountVal), 
        [subTotal, autoDiscountVal, manualDiscountVal]);

   useEffect(() => {
        const initData = async () => {
            setLoading(true);
            try {
                const [caRes, promoRes, prodRes, tableRes, cateRes] = await Promise.all([
                    doanhthuApi.getMaCaDangMo(),
                    promoApi.getActivePromos(),
                    orderApi.getProducts(),
                    tableApi.getTableName(maBan),
                    productApi.getLoaiSP()

                ]);
                setMaCaOpen(caRes.data.maCa || caRes.data);
                setAllPromos(promoRes.data);
                setProducts(prodRes.data);
                setNameTable(tableRes.data.tenBan || `Bàn ${maBan}`);
                const serverCategories = cateRes.data.map(c => ({
                    id: c.maLoaiSanPham, 
                    name: c.tenLoaiSanPham
                }));
                
                // Luôn giữ "Tất cả" ở đầu danh sách
                setCategories([{ id: 'ALL', name: 'Tất cả' }, ...serverCategories]);
                
                const auto = promoRes.data.find(p => p.configs?.some(c => c.loaiDoiTuong === 'ALL'));
                if (auto) setAutoDiscount(auto);

                const orderRes = await orderApi.loadBan(maBan);
                if (orderRes.data && orderRes.data.items?.length > 0) {
                    const data = orderRes.data;
                    let idTuXuLy = data.maHoaDon || null;
                    
                    // Thêm tenSanPham từ products list nếu item không có
                    const itemsWithNames = data.items.map(item => {
                        const product = prodRes.data.find(p => p.maSanPham === item.maSanPham);
                        return {
                            ...item,
                            tenSanPham: product?.tenSanPham || item.tenSanPham || item.maSanPham
                        };
                    });
                    
                    setCart(itemsWithNames);
                    setOriginalCart(itemsWithNames.map(item => ({ ...item })));
                    setMaHoaDon(idTuXuLy);
                } else {
                    setCart([]);
                    setMaHoaDon(null);
                }
            } catch (err) {
                console.error("Lỗi khởi tạo:", err);
                alert("Không thể tải dữ liệu thực đơn!");
            } finally {
                setLoading(false);
            }
        };
        if (maBan) initData();
    }, [maBan]);

    
   const filteredProducts = React.useMemo(() => {
        return products
            .filter(p => {
                if (activeCategory === 'ALL') return true;

                return (p.maLoaiSanPham === activeCategory) || (p.loaiSanPham?.maLoaiSanPham === activeCategory);
            })
            .filter(p => 
                p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.maSanPham.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [products, activeCategory, searchTerm]);


    const handleConfirmOrder = async (isGoingToPayment = false) => {
            if (cart.length === 0) return null;
            try {
                const orderData = { 
                    maHoaDon, maBan, maCa: maCaOpen,
                    items: cart.map(i => ({ 
                        maSanPham: i.maSanPham, 
                        soLuong: i.soLuong, 
                        giaBan: i.giaBan, 
                        ghiChu: i.ghiChu || "" 
                    })),
                    tongTien: totalAmount
                };
                
                const res = await orderApi.staffCreate(orderData);
                const newMaHD = res.data.hoaDon?.maHoaDon || res.data.savedHD?.maHoaDon || res.data.maHoaDon || maHoaDon;
                if (newMaHD) setMaHoaDon(newMaHD);
                
                await tableApi.updateTrangThai(maBan, 'PENDING');
                setOriginalCart(cart.map(item => ({ ...item, slipNote: undefined })));
                
                if (!isGoingToPayment) {
                    navigate('/sell');
                }
                return newMaHD;
            } catch (err) { 
                alert("Lỗi khi lưu đơn hàng!");
                return null; 
            }
    };
    const handlePrepareKitchenSlip = () => {
                if (cart.length === 0) {
                alert("Chưa có món nào được chọn! Vui lòng chọn món trước khi báo bếp.");
                return;
            }

                const printItems = [];
                const buildSlipNote = (item, action) => {
                    if (item?.ghiChu) {
                        return `${action} - ${item.ghiChu}`;
                    }
                    return action;
                };

                // 1. Tìm món mới hoặc món tăng số lượng
                cart.forEach(item => {
                    const oldItem = originalCart.find(o => o.maSanPham === item.maSanPham);
                    if (!oldItem) {
                        // Món mới hoàn toàn
                        printItems.push({ ...item, slipNote: buildSlipNote(item, "MỚI") });
                    } else if (item.soLuong > oldItem.soLuong) {
                        // Tăng số lượng
                        printItems.push({
                            ...item,
                            soLuong: item.soLuong - oldItem.soLuong,
                            slipNote: buildSlipNote(item, "THÊM")
                        });
                    } else if (item.soLuong < oldItem.soLuong) {
                        // Giảm số lượng
                        printItems.push({
                            ...item,
                            soLuong: oldItem.soLuong - item.soLuong,
                            slipNote: buildSlipNote(item, "GIẢM/HỦY")
                        });
                    } else if (item.ghiChu !== oldItem.ghiChu) {
                        // Ghi chú thay đổi mà số lượng không đổi
                        printItems.push({
                            ...item,
                            slipNote: item.ghiChu || "CẬP NHẬT"
                        });
                    }
                });

                // 2. Tìm món bị xóa sạch khỏi giỏ hàng
                originalCart.forEach(oldItem => {
                    const stillInCart = cart.find(c => c.maSanPham === oldItem.maSanPham);
                    if (!stillInCart) {
                        printItems.push({ ...oldItem, slipNote: buildSlipNote(oldItem, "HỦY MÓN") });
                    }
                });

                if (printItems.length > 0) {
                    setItemsToPrint(printItems);
                    setIsKitchenSlipOpen(true);
                } else {
                    // Nếu không có gì thay đổi so với DB, chỉ cần lưu hoặc báo thành công
                    handleConfirmOrder(false);
                }
        };
    const handleGoToPayment = async () => {
            const finalMaHoaDon = await handleConfirmOrder(true);
            if (!finalMaHoaDon) return;
            
            navigate(`/payment/${maBan}`, {
                state: { 
                    maHoaDon: finalMaHoaDon, 
                    cart, 
                    maCa: maCaOpen, 
                    totalAmount, 
                    subTotal, 
                    manualDiscount, 
                    autoDiscount,
                    nameTable 
                }
            });
        };
    const addToCart = (p) => {
        const existing = cart.find(i => i.maSanPham === p.maSanPham);
        if (existing) setCart(cart.map(i => i.maSanPham === p.maSanPham ? { ...i, soLuong: i.soLuong + 1 } : i));
        else setCart([...cart, { ...p, giaBan: p.giaBan || p.donGia, soLuong: 1 }]);
    };


    if (loading) return <div className="order-loading">Đang chuẩn bị thực đơn...</div>;
    
    return (
        <div className="order-page-wrapper">
            {/* THỰC ĐƠN BÊN TRÁI */}
            <main className="menu-container">
                <header className="menu-header">
                    <div className="header-title">
                        <h2>Thực đơn gọi món</h2>
                    </div>
                    <div className="menu-search">
                        <Search size={18} />
                        <input 
                            type="text" placeholder="Tìm tên món, mã sản phẩm..." 
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && <X size={16} className="clear-search" onClick={() => setSearchTerm('')} />}
                    </div>
                </header>

                <CategoryTab 
                    categories={categories} 
                    activeId={activeCategory} 
                    onSelect={setActiveCategory} 
                />

                <div className="product-scroll-area">
                    <div className="product-grid-modern">
                            {filteredProducts.map(p => (
                                <PhanLoaiCard 
                                    key={p.maSanPham}
                                    title={p.tenSanPham}
                                    subtitle={p.giaBan?.toLocaleString('vi-VN') || p.donGia?.toLocaleString('vi-VN')} đ
                                    image={p.duongDanHinh}
                                    onClick={() => addToCart(p)}
                                    type="product"
                                />
                            ))
                        }
                    </div>
                </div>
            </main>

            {/* GIỎ HÀNG BÊN PHẢI */}
            <aside className="cart-container">
                <header className="cart-header-modern">
                    <div className="cart-info">
                        <ShoppingCart size={20} />
                        <h3>Chi tiết hóa đơn</h3>
                    </div>
                    <div className="cart-actions-top" ref={menuRef}>
                        <span className="table-label">{nameTable}</span>
                        <button className="btn-more" onClick={() => setShowMenu(!showMenu)}><MoreVertical size={20}/></button>
                            <OrderDropdown 
                            show={showMenu} onClose={() => setShowMenu(false)}
                            onOpenPromo={() => { setIsPromoModalOpen(true); setShowMenu(false); }}
                            onPrintKitchen={handlePrepareKitchenSlip}
                        />
                    </div>
                </header>

                <div className="cart-items-area">
                    <CartList 
                        cart={cart} 
                        onRemoveItem={(idx) => {
                            const item = cart[idx];
                            if (!item.maChiTietHD) setCart(prev => prev.filter((_, i) => i !== idx));
                            else setDeleteConfirm({ open: true, index: idx, item });
                        }}
                        onUpdateQty={(idx, qty) => {
                            const newCart = [...cart];
                            newCart[idx] = { ...newCart[idx], soLuong: qty };
                            setCart(newCart);
                        }}
                        onItemClick={(idx) => { setEditingIdx(idx); setIsNoteModalOpen(true); }}
                    />
                </div>

                <CartFooter 
                    autoDiscount={autoDiscount} autoDiscountVal={autoDiscountVal}
                    manualDiscount={manualDiscount} manualDiscountVal={manualDiscountVal}
                    totalAmount={totalAmount}
                    onConfirm={handlePrepareKitchenSlip}
                    onPayment={handleGoToPayment}
                    onDelete={async () => {
                        const res = await tableApi.getBanTrong(maBan);
                        const status = res.data?.trangThaiThanhToan || res.data?.trangThai;
                        if (status === 'PAID') {
                            setCart([]); setMaHoaDon(null); navigate('/sell');
                        } else alert("Bàn chưa thanh toán!");
                    }}
                />
            </aside>

            {/* CÁC MODAL PHỤ TRỢ (Giữ nguyên component) */}
            <NoteModal isOpen={isNoteModalOpen} item={cart[editingIdx]} onSave={(note) => {
                const newCart = [...cart];
                newCart[editingIdx] = { ...newCart[editingIdx], ghiChu: note };
                setCart(newCart);
                setIsNoteModalOpen(false);
            }} onClose={() => setIsNoteModalOpen(false)} />
            
            <ConfirmDeleteModal isOpen={deleteConfirm.open} itemName={deleteConfirm.item?.tenSanPham} 
                onCancel={() => setDeleteConfirm({ open: false, item: null })}
                onConfirm={async () => {
                    await orderApi.removeOrderItem(deleteConfirm.item.maChiTietHD);
                    setCart(prev => prev.filter((_, i) => i !== deleteConfirm.index));
                    setDeleteConfirm({ open: false, index: null, item: null });
                }} 
            />

            <PromotionModal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} promos={allPromos.filter(p => p.configs?.some(c => c.loaiDoiTuong === 'SELECTIVE'))}
                onSelect={(p) => { setManualDiscount(p); setIsPromoModalOpen(false); }} />

            <KitchenSlipModal 
            isOpen={isKitchenSlipOpen} 
            onClose={() => setIsKitchenSlipOpen(false)} nameTable={nameTable} cart={itemsToPrint}
            onConfirm={async () => { 
                await handleConfirmOrder(false);
                setIsKitchenSlipOpen(false); 
            }} 
            maHoaDon={maHoaDon}
            />
        </div>
    );
};

export default OrderPage;
