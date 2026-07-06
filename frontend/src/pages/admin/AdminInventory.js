import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon, icons } from '../../utils/icons';
import { formatPrice } from '../../utils/formatPrice';
import api from '../../services/axiosInstance';

const AdminInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // View mode: 'overview' (dashboard) or 'details' (full table list)
    const [viewMode, setViewMode] = useState('overview');
    
    // Search for the details table
    const [search, setSearch] = useState('');
    
    // History list initialized from localStorage to persist user imports
    const [importHistory, setImportHistory] = useState(() => {
        try {
            const saved = localStorage.getItem('inventory_import_history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Save history when it changes
    useEffect(() => {
        try {
            localStorage.setItem('inventory_import_history', JSON.stringify(importHistory));
        } catch (err) {
            console.error('Failed to save import history:', err);
        }
    }, [importHistory]);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/admin/inventory');
            setInventory(res.data || []);
        } catch (err) {
            console.error('Error fetching inventory:', err);
            setError('Không thể tải dữ liệu kho hàng.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // Handle editing stock quantity (either via prompt or double-clicking)
    const handleSetStockSubmit = async (variantId, newStock, productName, variantDetails) => {
        setError('');
        const parsedStock = parseInt(newStock);
        if (isNaN(parsedStock) || parsedStock < 0) {
            alert('Vui lòng nhập số lượng hợp lệ (lớn hơn hoặc bằng 0).');
            return;
        }

        // Find existing item to log import change
        const currentItem = inventory.find(item => item.variantId === variantId);
        const originalStock = currentItem ? currentItem.stock : 0;
        const diff = parsedStock - originalStock;

        try {
            await api.put(`/api/admin/inventory/set?variantId=${variantId}&stock=${parsedStock}`);
            setSuccessMessage(`Đã cập nhật tồn kho của "${productName}" thành ${parsedStock} sản phẩm.`);
            
            // Add entry to import history if there's a change
            if (diff !== 0) {
                const historyEntry = {
                    id: Date.now(),
                    productName,
                    variantDetails,
                    originalStock,
                    newStock: parsedStock,
                    change: diff > 0 ? `+${diff}` : `${diff}`,
                    type: diff > 0 ? 'import' : 'export',
                    timestamp: new Date().toLocaleString('vi-VN')
                };
                setImportHistory(prev => [historyEntry, ...prev].slice(0, 20)); // Keep last 20 entries
            }

            fetchInventory();
            setTimeout(() => setSuccessMessage(''), 4000);
        } catch (err) {
            console.error('Error setting stock:', err);
            setError('Không thể điều chỉnh kho hàng.');
        }
    };

    // Prompt for updating stock
    const triggerEditStock = (item) => {
        const variantDetails = `${item.color || ''} - Size ${item.size || 'Mặc định'}`;
        const newStock = prompt(
            `Nhập số lượng tồn kho mới cho mặt hàng:\n"${item.productName} (${variantDetails})"\nTồn kho hiện tại: ${item.stock}`, 
            item.stock
        );
        if (newStock !== null) {
            handleSetStockSubmit(item.variantId, newStock, item.productName, variantDetails);
        }
    };

    // Prompt for adding import stock
    const triggerImportStock = (item) => {
        const variantDetails = `${item.color || ''} - Size ${item.size || 'Mặc định'}`;
        const addAmount = prompt(
            `NHẬP HÀNG BỔ SUNG cho mặt hàng:\n"${item.productName} (${variantDetails})"\nTồn kho hiện tại: ${item.stock}\n\nNhập số lượng nhập thêm:`, 
            '10'
        );
        if (addAmount !== null) {
            const parsedAdd = parseInt(addAmount);
            if (isNaN(parsedAdd) || parsedAdd <= 0) {
                alert('Vui lòng nhập số lượng lớn hơn 0.');
                return;
            }
            handleSetStockSubmit(item.variantId, item.stock + parsedAdd, item.productName, variantDetails);
        }
    };

    // Memoized metrics matching the mockup
    const metrics = useMemo(() => {
        const totalVariants = inventory.length;
        let totalStock = 0;
        let lowStockCount = 0;
        let outOfStockCount = 0;
        let totalValue = 0;

        inventory.forEach(item => {
            const stock = item.stock || 0;
            totalStock += stock;
            if (stock === 0) {
                outOfStockCount++;
            } else if (stock < 10) {
                lowStockCount++;
            }
            totalValue += stock * (item.price || 0);
        });

        return {
            totalVariants,
            totalStock,
            lowStockCount,
            outOfStockCount,
            totalValue
        };
    }, [inventory]);

    // Categories stock grouping matching mockup chart
    const categoryDistribution = useMemo(() => {
        const groups = {};
        inventory.forEach(item => {
            const cat = item.categoryName || 'Khác';
            groups[cat] = (groups[cat] || 0) + (item.stock || 0);
        });

        // Convert to array and sort by quantity descending
        return Object.entries(groups)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity);
    }, [inventory]);

    // Maximum category quantity for progress bar scaling
    const maxCategoryQty = useMemo(() => {
        if (categoryDistribution.length === 0) return 1;
        return Math.max(...categoryDistribution.map(c => c.quantity), 1);
    }, [categoryDistribution]);

    // Low stock warnings
    const lowStockItems = useMemo(() => {
        return inventory
            .filter(item => (item.stock || 0) < 10)
            .sort((a, b) => (a.stock || 0) - (b.stock || 0));
    }, [inventory]);

    // Table filter for the detailed list view
    const filteredInventory = inventory.filter(item => 
        item.productName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-inventory-container" style={{ fontFamily: 'Inter, sans-serif' }}>
            
            {/* Upper Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                        {viewMode === 'overview' ? 'Tổng quan tồn kho' : 'Chi tiết danh sách tồn kho'}
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                        Cập nhật theo thời gian thực từ kho hàng của hệ thống.
                    </p>
                </div>

                <button 
                    onClick={() => setViewMode(viewMode === 'overview' ? 'details' : 'overview')}
                    style={{
                        padding: '0.6rem 1.2rem',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.15)',
                        transition: 'all 0.2s'
                    }}
                >
                    <FontAwesomeIcon icon={viewMode === 'overview' ? icons.edit : icons.home} />
                    {viewMode === 'overview' ? 'Xem chi tiết tồn kho' : 'Quay lại tổng quan'}
                </button>
            </div>

            {/* Success / Error Alerts */}
            {successMessage && (
                <div style={{ marginBottom: '1.2rem', padding: '0.8rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', border: '1px solid #a7f3d0' }}>
                    <FontAwesomeIcon icon={icons.checkCircle} style={{ color: '#10b981' }} />
                    <strong>Thành công:</strong> {successMessage}
                </div>
            )}
            {error && (
                <div style={{ marginBottom: '1.2rem', padding: '0.8rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                    <FontAwesomeIcon icon={icons.warning} style={{ color: '#ef4444' }} />
                    <strong>Lỗi:</strong> {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '1.1rem' }}>
                    Đang tải dữ liệu kho hàng...
                </div>
            ) : (
                <>
                    {viewMode === 'overview' ? (
                        /* ================== VIEW MODE: OVERVIEW (MOCKUP STYLE) ================== */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            
                            {/* 5 Stats Cards Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
                                
                                {/* Card 1: Tổng biến thể */}
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '1.3rem' }}>
                                        <FontAwesomeIcon icon={icons.products} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Tổng biến thể</div>
                                        <div style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>{metrics.totalVariants}</div>
                                    </div>
                                </div>

                                {/* Card 2: Tổng tồn kho */}
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6', fontSize: '1.3rem' }}>
                                        <FontAwesomeIcon icon={icons.truck} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Tổng tồn kho</div>
                                        <div style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>{metrics.totalStock}</div>
                                    </div>
                                </div>

                                {/* Card 3: Sắp hết hàng */}
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontSize: '1.3rem' }}>
                                        <FontAwesomeIcon icon={icons.warning} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Sắp hết hàng</div>
                                        <div style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>{metrics.lowStockCount}</div>
                                    </div>
                                </div>

                                {/* Card 4: Hết hàng */}
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '1.3rem' }}>
                                        <FontAwesomeIcon icon={icons.close} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Hết hàng</div>
                                        <div style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: '800', marginTop: '2px' }}>{metrics.outOfStockCount}</div>
                                    </div>
                                </div>

                                {/* Card 5: Giá trị tồn kho */}
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.3rem' }}>
                                        <FontAwesomeIcon icon={icons.creditCard} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Giá trị ước tính</div>
                                        <div style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: '800', marginTop: '6px', whiteSpace: 'nowrap' }}>
                                            {formatPrice(metrics.totalValue)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Column block: Warnings & Import History */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                
                                {/* Box 1: Cảnh báo tồn kho */}
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Cảnh báo tồn kho</h3>
                                        <span style={{ fontSize: '0.78rem', background: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '20px', fontWeight: '600' }}>
                                            {lowStockItems.length} mục
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {lowStockItems.length === 0 ? (
                                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                                                Tất cả sản phẩm đều đủ số lượng.
                                            </div>
                                        ) : (
                                            lowStockItems.map(item => (
                                                <div 
                                                    key={item.variantId}
                                                    onClick={() => triggerEditStock(item)}
                                                    style={{
                                                        display: 'flex', 
                                                        justifyContent: 'space-between', 
                                                        alignItems: 'center', 
                                                        padding: '0.75rem', 
                                                        border: '1px solid #f1f5f9', 
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}
                                                >
                                                    <div style={{ flex: 1, paddingRight: '10px' }}>
                                                        <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e293b', lineHeight: '1.3' }}>
                                                            {item.productName}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                                                            Phân loại: {item.color || 'Không có'} - Size: {item.size || 'Mặc định'}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '500', marginTop: '2px' }}>
                                                            Còn {item.stock} / tối thiểu 10
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span style={{
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '6px',
                                                            background: item.stock === 0 ? '#fee2e2' : '#fffbeb',
                                                            color: item.stock === 0 ? '#ef4444' : '#d97706'
                                                        }}>
                                                            {item.stock === 0 ? 'Hết hàng' : 'Sắp hết'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Box 2: Lịch sử nhập hàng gần đây */}
                                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Lịch sử nhập hàng gần đây</h3>
                                        <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '20px' }}>Gần đây</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
                                        {importHistory.length === 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '3rem 0', color: '#94a3b8' }}>
                                                <FontAwesomeIcon icon={icons.products} style={{ fontSize: '2.5rem', color: '#cbd5e1', marginBottom: '1rem' }} />
                                                <span>Chưa có lịch sử nhập hàng</span>
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Lịch sử sẽ tự ghi lại khi bạn sửa tồn kho.</span>
                                            </div>
                                        ) : (
                                            importHistory.map(entry => (
                                                <div 
                                                    key={entry.id}
                                                    style={{
                                                        padding: '0.75rem', 
                                                        borderLeft: entry.type === 'import' ? '4px solid #10b981' : '4px solid #f59e0b',
                                                        background: '#f8fafc',
                                                        borderRadius: '0 8px 8px 0',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <strong style={{ color: '#1e293b' }}>{entry.productName}</strong>
                                                        <span style={{
                                                            fontSize: '0.78rem',
                                                            fontWeight: '700',
                                                            color: entry.type === 'import' ? '#10b981' : '#f59e0b'
                                                        }}>
                                                            {entry.change}
                                                        </span>
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                                                        Phân loại: {entry.variantDetails}
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.7rem', marginTop: '4px' }}>
                                                        <span>Kho cũ: {entry.originalStock} → Mới: {entry.newStock}</span>
                                                        <span>{entry.timestamp}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Section: Tồn kho theo danh mục */}
                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.2rem', marginTop: 0 }}>
                                    Phân bổ tồn kho theo danh mục
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {categoryDistribution.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>
                                            Chưa có sản phẩm nào được thiết lập danh mục.
                                        </div>
                                    ) : (
                                        categoryDistribution.map((cat, idx) => {
                                            const percent = Math.round((cat.quantity / maxCategoryQty) * 100);
                                            // Dynamic bar colors based on index for aesthetic harmony
                                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
                                            const barColor = colors[idx % colors.length];

                                            return (
                                                <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <span style={{ width: '120px', fontSize: '0.88rem', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {cat.name}
                                                    </span>
                                                    <div style={{ flex: 1, height: '12px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                                                        <div style={{ width: `${percent}%`, height: '100%', background: barColor, borderRadius: '6px', transition: 'width 0.5s ease-out' }}></div>
                                                    </div>
                                                    <span style={{ width: '80px', fontSize: '0.88rem', fontWeight: '700', color: '#1e293b', textAlign: 'right' }}>
                                                        {cat.quantity} sản phẩm
                                                    </span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Section: Hàng sắp về & cần đặt thêm */}
                            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', marginTop: 0 }}>
                                    Hàng sắp hết & cần nhập thêm
                                </h3>
                                <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '0 0 1.2rem 0' }}>
                                    Danh sách các mặt hàng có số lượng dưới 15 sản phẩm, cần nhập hàng bổ sung.
                                </p>

                                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600' }}>SẢN PHẨM</th>
                                                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600', width: '120px' }}>TỒN HIỆN TẠI</th>
                                                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600', width: '150px' }}>TỐC ĐỘ BÁN/NGÀY</th>
                                                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600', width: '140px' }}>DỰ KIẾN CÒN DÙNG</th>
                                                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600', width: '130px', textAlign: 'center' }}>TRẠNG THÁI</th>
                                                <th style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: '600', width: '120px', textAlign: 'center' }}>HÀNH ĐỘNG</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inventory.filter(i => i.stock < 15).length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                                        Không có mặt hàng nào thiếu hụt.
                                                    </td>
                                                </tr>
                                            ) : (
                                                inventory.filter(i => i.stock < 15).map(item => (
                                                    <tr key={item.variantId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                        <td style={{ padding: '0.85rem 1rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                <img 
                                                                    src={item.imageUrl || 'https://placehold.co/40x40?text=No+Image'} 
                                                                    alt={item.productName} 
                                                                    style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                                                />
                                                                <div>
                                                                    <strong style={{ color: '#1e293b', display: 'block' }}>{item.productName}</strong>
                                                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                                        {item.color || '—'} / {item.size || 'Mặc định'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e293b' }}>
                                                            {item.stock}
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                                                            0.0 hộp
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', color: '#475569', fontWeight: '500' }}>
                                                            {item.stock === 0 ? (
                                                                <span style={{ color: '#ef4444' }}>Hết hàng</span>
                                                            ) : item.stock < 5 ? (
                                                                <span style={{ color: '#f59e0b' }}>~1-3 ngày</span>
                                                            ) : (
                                                                <span>~14+ ngày</span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                fontWeight: '700',
                                                                background: '#fffbeb',
                                                                color: '#d97706',
                                                                padding: '0.25rem 0.5rem',
                                                                borderRadius: '6px',
                                                                border: '1px solid #fef3c7'
                                                            }}>
                                                                Cần đặt thêm
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                                                            <button 
                                                                onClick={() => triggerImportStock(item)}
                                                                style={{
                                                                    background: '#10b981',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    padding: '0.35rem 0.75rem',
                                                                    fontSize: '0.78rem',
                                                                    fontWeight: '600',
                                                                    borderRadius: '6px',
                                                                    cursor: 'pointer',
                                                                    boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)',
                                                                    transition: 'background 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.background = '#059669'}
                                                                onMouseLeave={(e) => e.target.style.background = '#10b981'}
                                                            >
                                                                Đặt thêm
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ================== VIEW MODE: DETAILS (SIMPLIFIED ROW CLICK LIST) ================== */
                        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.2rem', marginTop: 0 }}>
                                <FontAwesomeIcon icon={icons.infoCircle} style={{ marginRight: '6px', color: '#3b82f6' }} />
                                Hướng dẫn: Chỉ cần <strong>nhấp chuột vào tên mặt hàng hoặc số lượng tồn kho</strong> để chỉnh sửa nhanh.
                            </p>

                            <div className="action-header-row" style={{ marginBottom: '1.2rem' }}>
                                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Tìm kiếm theo tên sản phẩm..." 
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                                            border: '1.5px solid #cbd5e1',
                                            borderRadius: '8px',
                                            outline: 'none',
                                            fontSize: '0.9rem',
                                            background: '#f8fafc'
                                        }}
                                    />
                                    <FontAwesomeIcon 
                                        icon={icons.search} 
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <th style={{ padding: '0.8rem 1rem', color: '#475569', fontWeight: '600' }}>Tên mặt hàng (Nhấp để sửa)</th>
                                            <th style={{ padding: '0.8rem 1rem', color: '#475569', fontWeight: '600', width: '180px' }}>Tồn kho hiện tại</th>
                                            <th style={{ padding: '0.8rem 1rem', color: '#475569', fontWeight: '600', width: '150px', textAlign: 'center' }}>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInventory.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                                    Không tìm thấy mặt hàng nào phù hợp.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredInventory.map((item) => (
                                                <tr 
                                                    key={item.variantId} 
                                                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.2s' }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    <td 
                                                        onClick={() => triggerEditStock(item)}
                                                        style={{ padding: '1rem', verticalAlign: 'middle' }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <img 
                                                                src={item.imageUrl || 'https://placehold.co/40x40?text=No+Image'} 
                                                                alt={item.productName} 
                                                                style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                                                            />
                                                            <div>
                                                                <strong style={{ color: '#1e293b', fontSize: '0.95rem' }}>{item.productName}</strong>
                                                                <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                                                                    Màu sắc: {item.color || '—'} - Kích thước: {item.size || 'Mặc định'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td 
                                                        onClick={() => triggerEditStock(item)}
                                                        style={{ padding: '1rem', verticalAlign: 'middle', fontWeight: '700', fontSize: '1.05rem', color: '#1e293b' }}
                                                    >
                                                        {item.stock}
                                                    </td>
                                                    <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                                                        {item.stock === 0 ? (
                                                            <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', background: '#fee2e2', color: '#ef4444', fontWeight: '600' }}>Hết hàng</span>
                                                        ) : item.stock < 10 ? (
                                                            <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', background: '#ffedd5', color: '#f97316', fontWeight: '600' }}>Sắp hết hàng</span>
                                                        ) : (
                                                            <span style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', background: '#d1fae5', color: '#10b981', fontWeight: '600' }}>Còn hàng</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminInventory;
