import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import api from '../../services/axiosInstance';

const MONTHS = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

const STATUS_COLORS = {
    pending:           '#f59e0b',
    cod_pending:       '#f59e0b',
    pending_payment:   '#3b82f6',
    processing:        '#3b82f6',
    shipped:           '#8b5cf6',
    shipping:          '#8b5cf6',
    delivered:         '#10b981',
    cancelled:         '#ef4444',
    paid:              '#10b981',
    failed:            '#ef4444',
};

const STATUS_LABELS = {
    pending:           'Chờ xử lý',
    cod_pending:       'Chờ xử lý COD',
    pending_payment:   'Chờ thanh toán QR',
    processing:        'Đang xử lý',
    shipped:           'Đang giao',
    shipping:          'Đang giao',
    delivered:         'Hoàn thành',
    cancelled:         'Đã hủy',
    paid:              'Đã thanh toán',
    failed:            'Thất bại',
};

const PIE_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899'];

const formatVND = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(v || 0);

const formatShort = (v) => {
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B';
    if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000)         return (v / 1_000).toFixed(0) + 'K';
    return v;
};

const CustomTooltipBar = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className="custom-tooltip-box">
            <p className="tt-label">{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>
                    {p.name}: {p.name === 'Doanh thu' ? formatVND(p.value) : p.value + ' đơn'}
                </p>
            ))}
        </div>
    );
};

const CustomTooltipPie = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0];
    return (
        <div className="custom-tooltip-box">
            <p style={{ color: d.payload.fill || '#fff', fontWeight: 600 }}>{d.name}</p>
            <p>Số đơn: {d.payload.count}</p>
            <p>Doanh thu: {formatVND(d.payload.revenue)}</p>
        </div>
    );
};

const AdminAnalytics = ({ summary }) => {
    const currentYear = new Date().getFullYear();
    const [years, setYears] = useState([currentYear]);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [monthlyData, setMonthlyData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState('bar'); // 'bar' | 'line'

    // Fetch available years on mount
    useEffect(() => {
        api.get('/api/admin/analytics/years')
            .then(res => {
                const yr = res.data && res.data.length > 0 ? res.data : [currentYear];
                setYears(yr);
                setSelectedYear(yr[0]);
            })
            .catch(() => setYears([currentYear]));
    }, [currentYear]);

    const fetchChartData = useCallback(async (year) => {
        setLoading(true);
        try {
            const [monthRes, statusRes] = await Promise.all([
                api.get(`/api/admin/analytics/monthly?year=${year}`),
                api.get(`/api/admin/analytics/status?year=${year}`)
            ]);
            const monthly = (monthRes.data || []).map((d, i) => ({
                month: MONTHS[i],
                revenue: parseFloat(d.revenue || 0),
                orders: Number(d.orders || 0),
                cancelled: Number(d.cancelledOrders || 0),
            }));
            setMonthlyData(monthly);

            const statusList = (statusRes.data || []).map(d => {
                const statusKey = (d.status || '').toLowerCase();
                return {
                    name: STATUS_LABELS[statusKey] || d.status,
                    status: d.status,
                    count: Number(d.count || 0),
                    revenue: parseFloat(d.revenue || 0),
                    fill: STATUS_COLORS[statusKey] || '#6366f1',
                };
            });
            setStatusData(statusList);
        } catch (e) {
            console.error('Analytics fetch error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchChartData(selectedYear);
    }, [selectedYear, fetchChartData]);

    const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0);
    const totalOrders  = monthlyData.reduce((s, d) => s + d.orders, 0);
    const totalCancelled = monthlyData.reduce((s, d) => s + d.cancelled, 0);
    const bestMonth = monthlyData.reduce((best, d) => d.revenue > best.revenue ? d : best, { revenue: 0, month: '-' });

    return (
        <div className="analytics-full-page">
            {/* Header Row */}
            <div className="analytics-header-row">
                <div className="analytics-year-selector">
                    <label>Năm thống kê</label>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="analytics-chart-toggle">
                    <button
                        className={chartType === 'bar' ? 'active' : ''}
                        onClick={() => setChartType('bar')}
                    >
                        📊 Cột
                    </button>
                    <button
                        className={chartType === 'line' ? 'active' : ''}
                        onClick={() => setChartType('line')}
                    >
                        📈 Đường
                    </button>
                </div>
            </div>

            {/* Summary KPI Cards */}
            <div className="analytics-cards-grid">
                <div className="analytics-card card-revenue">
                    <div className="card-info">
                        <h3>Tổng doanh thu</h3>
                        <span className="card-number">{formatVND(summary?.totalRevenue || totalRevenue)}</span>
                        <span className="card-sub">Năm {selectedYear}</span>
                    </div>
                    <div className="card-icon-wrapper">💰</div>
                </div>
                <div className="analytics-card card-orders">
                    <div className="card-info">
                        <h3>Tổng đơn hàng</h3>
                        <span className="card-number">{summary?.totalOrders || totalOrders} đơn</span>
                        <span className="card-sub">Năm {selectedYear}</span>
                    </div>
                    <div className="card-icon-wrapper">📦</div>
                </div>
                <div className="analytics-card card-products">
                    <div className="card-info">
                        <h3>Đã hủy</h3>
                        <span className="card-number">{totalCancelled} đơn</span>
                        <span className="card-sub">Năm {selectedYear}</span>
                    </div>
                    <div className="card-icon-wrapper">❌</div>
                </div>
                <div className="analytics-card card-customers">
                    <div className="card-info">
                        <h3>Tháng cao nhất</h3>
                        <span className="card-number">{bestMonth.month}</span>
                        <span className="card-sub">{formatVND(bestMonth.revenue)}</span>
                    </div>
                    <div className="card-icon-wrapper">🏆</div>
                </div>
            </div>

            {loading ? (
                <div className="admin-loading-spinner" style={{margin:'40px auto'}}>Đang tải biểu đồ...</div>
            ) : (
                <>
                    {/* Bar / Line Chart: Revenue by Month */}
                    <div className="chart-panel">
                        <h3 className="chart-title">Doanh thu theo tháng — {selectedYear}</h3>
                        <ResponsiveContainer width="100%" height={320}>
                            {chartType === 'bar' ? (
                                <BarChart data={monthlyData} margin={{ top: 10, right: 24, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 13 }} />
                                    <YAxis tickFormatter={formatShort} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltipBar />} />
                                    <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                                    <Bar dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[6,6,0,0]} />
                                </BarChart>
                            ) : (
                                <LineChart data={monthlyData} margin={{ top: 10, right: 24, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 13 }} />
                                    <YAxis tickFormatter={formatShort} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltipBar />} />
                                    <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                                    <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Orders Chart */}
                    <div className="chart-panel">
                        <h3 className="chart-title">Số đơn hàng theo tháng — {selectedYear}</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={monthlyData} margin={{ top: 10, right: 24, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 13 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltipBar />} />
                                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                                <Bar dataKey="orders" name="Tổng đơn" fill="#3b82f6" radius={[6,6,0,0]} />
                                <Bar dataKey="cancelled" name="Đã hủy" fill="#ef4444" radius={[6,6,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Status Breakdown Row */}
                    {statusData.length > 0 && (
                        <div className="chart-row-2col">
                            {/* Pie Chart */}
                            <div className="chart-panel chart-panel-half">
                                <h3 className="chart-title">Tỷ lệ trạng thái đơn hàng</h3>
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={110}
                                            paddingAngle={4}
                                            dataKey="count"
                                            nameKey="name"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            labelLine={{ stroke: '#64748b' }}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltipPie />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Status Table */}
                            <div className="chart-panel chart-panel-half">
                                <h3 className="chart-title">Chi tiết theo trạng thái</h3>
                                <div className="status-breakdown-table">
                                    <div className="sbt-header">
                                        <span>Trạng thái</span>
                                        <span>Số đơn</span>
                                        <span>Doanh thu</span>
                                    </div>
                                    {statusData.map((d, i) => (
                                        <div key={i} className="sbt-row">
                                            <span className="sbt-status">
                                                <span className="sbt-dot" style={{ background: d.fill }}></span>
                                                {d.name}
                                            </span>
                                            <span className="sbt-count">{d.count}</span>
                                            <span className="sbt-revenue">{formatVND(d.revenue)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminAnalytics;
