import React, { useCallback, useEffect, useState } from 'react';
import api from '../../services/axiosInstance';

const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

const STATUS_LABELS = {
    WAITING_CONFIRMATION: 'Chờ xác nhận',
    WAITING_PICKUP: 'Chờ lấy hàng',
    SHIPPING: 'Chờ vận chuyển',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy',
    pending: 'Chờ xử lý',
    cod_pending: 'Chờ xử lý COD',
    pending_payment: 'Chờ thanh toán QR',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

const STATUS_COLORS = {
    WAITING_CONFIRMATION: '#f59e0b',
    WAITING_PICKUP: '#3b82f6',
    SHIPPING: '#8b5cf6',
    DELIVERED: '#10b981',
    CANCELLED: '#ef4444',
    pending: '#f59e0b',
    cod_pending: '#f59e0b',
    pending_payment: '#3b82f6',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
};

const formatVND = (value) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value || 0);

const AdminAnalytics = ({ summary }) => {
    const currentYear = new Date().getFullYear();
    const [years, setYears] = useState([currentYear]);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [monthlyData, setMonthlyData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/admin/analytics/years')
            .then((res) => {
                const availableYears = res.data?.length ? res.data : [currentYear];
                setYears(availableYears);
                setSelectedYear(availableYears[0]);
            })
            .catch(() => setYears([currentYear]));
    }, [currentYear]);

    const fetchChartData = useCallback(async (year) => {
        setLoading(true);
        try {
            const [monthRes, statusRes] = await Promise.all([
                api.get(`/api/admin/analytics/monthly?year=${year}`),
                api.get(`/api/admin/analytics/status?year=${year}`),
            ]);

            setMonthlyData((monthRes.data || []).map((item, index) => ({
                month: MONTHS[index],
                revenue: Number(item.revenue || 0),
                orders: Number(item.orders || 0),
                cancelled: Number(item.cancelledOrders || 0),
            })));

            setStatusData((statusRes.data || []).map((item) => {
                const status = item.status || '';
                return {
                    status,
                    name: STATUS_LABELS[status] || STATUS_LABELS[status.toLowerCase()] || status,
                    count: Number(item.count || 0),
                    revenue: Number(item.revenue || 0),
                    color: STATUS_COLORS[status] || STATUS_COLORS[status.toLowerCase()] || '#64748b',
                };
            }));
        } catch (err) {
            console.error('Analytics fetch error:', err);
            setMonthlyData([]);
            setStatusData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChartData(selectedYear);
    }, [selectedYear, fetchChartData]);

    const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = monthlyData.reduce((sum, item) => sum + item.orders, 0);
    const totalCancelled = monthlyData.reduce((sum, item) => sum + item.cancelled, 0);
    const maxRevenue = Math.max(...monthlyData.map((item) => item.revenue), 1);
    const maxOrders = Math.max(...monthlyData.map((item) => item.orders), 1);
    const bestMonth = monthlyData.reduce(
        (best, item) => (item.revenue > best.revenue ? item : best),
        { month: '-', revenue: 0 },
    );

    return (
        <div className="analytics-full-page">
            <div className="analytics-header-row">
                <div className="analytics-year-selector">
                    <label>Năm thống kê</label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="analytics-cards-grid">
                <div className="analytics-card card-revenue">
                    <div className="card-info">
                        <h3>Tổng doanh thu</h3>
                        <span className="card-number">{formatVND(summary?.totalRevenue || totalRevenue)}</span>
                        <span className="card-sub">Năm {selectedYear}</span>
                    </div>
                </div>
                <div className="analytics-card card-orders">
                    <div className="card-info">
                        <h3>Tổng đơn hàng</h3>
                        <span className="card-number">{summary?.totalOrders || totalOrders} đơn</span>
                        <span className="card-sub">Năm {selectedYear}</span>
                    </div>
                </div>
                <div className="analytics-card card-products">
                    <div className="card-info">
                        <h3>Đã hủy</h3>
                        <span className="card-number">{totalCancelled} đơn</span>
                        <span className="card-sub">Năm {selectedYear}</span>
                    </div>
                </div>
                <div className="analytics-card card-customers">
                    <div className="card-info">
                        <h3>Tháng cao nhất</h3>
                        <span className="card-number">{bestMonth.month}</span>
                        <span className="card-sub">{formatVND(bestMonth.revenue)}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading-spinner" style={{ margin: '40px auto' }}>Đang tải biểu đồ...</div>
            ) : (
                <>
                    <div className="chart-panel">
                        <h3 className="chart-title">Doanh thu theo tháng - {selectedYear}</h3>
                        <div className="admin-simple-chart">
                            {monthlyData.map((item) => (
                                <div className="admin-simple-chart-col" key={item.month}>
                                    <div className="admin-simple-chart-value">{formatVND(item.revenue)}</div>
                                    <div
                                        className="admin-simple-chart-bar revenue"
                                        style={{ height: `${Math.max((item.revenue / maxRevenue) * 180, 6)}px` }}
                                    />
                                    <span>{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chart-panel">
                        <h3 className="chart-title">Số đơn theo tháng - {selectedYear}</h3>
                        <div className="admin-simple-chart">
                            {monthlyData.map((item) => (
                                <div className="admin-simple-chart-col" key={item.month}>
                                    <div className="admin-simple-chart-value">{item.orders} đơn</div>
                                    <div
                                        className="admin-simple-chart-bar orders"
                                        style={{ height: `${Math.max((item.orders / maxOrders) * 160, 6)}px` }}
                                    />
                                    <span>{item.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="chart-panel">
                        <h3 className="chart-title">Chi tiết theo trạng thái</h3>
                        <div className="status-breakdown-table">
                            <div className="sbt-header">
                                <span>Trạng thái</span>
                                <span>Số đơn</span>
                                <span>Doanh thu</span>
                            </div>
                            {statusData.map((item) => (
                                <div key={item.status || item.name} className="sbt-row">
                                    <span className="sbt-status">
                                        <span className="sbt-dot" style={{ background: item.color }} />
                                        {item.name}
                                    </span>
                                    <span className="sbt-count">{item.count}</span>
                                    <span className="sbt-revenue">{formatVND(item.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminAnalytics;
