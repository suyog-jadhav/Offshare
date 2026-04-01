import React, { useState, useEffect } from 'react';
import { DollarSign, Printer, Users, Wifi } from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardService, qrService, shopService } from '../services/api';
import { formatCurrency, formatDate, timeAgo } from '../utils/helpers';

const Dashboard = () => {
    console.log("🚀 Dashboard Component Rendering...");
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [wifiConfig, setWifiConfig] = useState({
        ssid: '',
        password: '',
        auth: 'WPA'
    });
    const [showConfig, setShowConfig] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("⚡ Dashboard Effect Running");
        fetchDashboardData();
        // Poll every 1 second for live updates
        const interval = setInterval(fetchDashboardData, 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch stats and activity
            const [statsRes, activityRes] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getRecentActivity(10)
            ]);
            console.log("📊 Dashboard Data Received:", statsRes);
            setStats(statsRes.data);
            setRecentActivity(activityRes.data);
        } catch (error) {
            console.error('❌ Error fetching dashboard data:', error);
            // alert("Dashboard API Error: " + error.message); // Optional alert for user visibility
        } finally {
            setLoading(false);
        }
    };

    // Initial QR Fetch
    useEffect(() => {
        fetchQRCode();
    }, []);

    const fetchQRCode = async () => {
        try {
            // Fetch QR independently so it loads even if stats fail
            const qrRes = await qrService.get(wifiConfig);
            setQrCode(qrRes.data.qr);
        } catch (error) {
            console.error('Error fetching QR code:', error);
        }
    };

    const fetchShopDetails = async () => {
        try {
            const res = await shopService.get();
            if (res.data) {
                setWifiConfig({
                    ssid: res.data.wifi_ssid || '',
                    password: res.data.wifi_password || '',
                    auth: res.data.wifi_auth || 'WPA'
                });
            }
        } catch (error) {
            console.error("Failed to fetch shop details:", error);
        }
    };

    const handleConfigChange = (e) => {
        setWifiConfig({ ...wifiConfig, [e.target.name]: e.target.value });
    };

    const handleConfigSubmit = async (e) => {
        e.preventDefault();
        try {
            // Save to DB
            await shopService.update(wifiConfig);
            // Refresh QR
            fetchQRCode();
            setShowConfig(false);
        } catch (error) {
            console.error("Failed to update shop wifi config:", error);
            alert("Failed to save WiFi config");
        }
    };

    // Initial load
    useEffect(() => {
        fetchShopDetails();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <h1 className="text-2xl font-bold text-gray-500">Loading Dashboard Data...</h1>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Revenue"
                    value={formatCurrency(stats?.revenue_today || 0)}
                    icon={DollarSign}
                    color="success"
                />
                <StatCard
                    title="Today's Jobs"
                    value={stats?.total_jobs_today || 0}
                    icon={Printer}
                    color="primary"
                />
                <StatCard
                    title="Total Customers"
                    value={stats?.total_customers || 0}
                    icon={Users}
                    color="info"
                />
                <StatCard
                    title="Active Sessions"
                    value={stats?.active_sessions || 0}
                    icon={Wifi}
                    color="warning"
                />
            </div>

            {/* QR Code and Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* QR Code Card */}
                <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white flex flex-col items-center justify-center text-center p-6 relative">
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                        title="Configure WiFi"
                    >
                        <Wifi size={16} />
                    </button>

                    <h3 className="text-xl font-bold mb-2">Connect to Shop</h3>
                    <p className="text-primary-100 mb-4 text-sm">Scan to connect device</p>

                    {showConfig ? (
                        <form onSubmit={handleConfigSubmit} className="w-full bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <input
                                type="text"
                                name="ssid"
                                placeholder="WiFi SSID"
                                value={wifiConfig.ssid}
                                onChange={handleConfigChange}
                                className="w-full mb-2 p-2 text-sm rounded text-gray-900 border-none focus:ring-2 focus:ring-primary-500"
                            />
                            <input
                                type="text"
                                name="password"
                                placeholder="WiFi Password"
                                value={wifiConfig.password}
                                onChange={handleConfigChange}
                                className="w-full mb-2 p-2 text-sm rounded text-gray-900 border-none focus:ring-2 focus:ring-primary-500"
                            />
                            <select
                                name="auth"
                                value={wifiConfig.auth}
                                onChange={handleConfigChange}
                                className="w-full mb-2 p-2 text-sm rounded text-gray-900 border-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">Open</option>
                            </select>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-white text-primary-600 py-1.5 rounded text-sm font-semibold hover:bg-primary-50">
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowConfig(false)}
                                    className="px-3 py-1.5 rounded text-sm font-semibold hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        qrCode ? (
                            <div className="bg-white p-3 rounded-lg shadow-lg cursor-pointer" onClick={() => setShowConfig(true)}>
                                <img src={qrCode} alt="Shop QR Code" className="w-48 h-48 object-contain" />
                            </div>
                        ) : (
                            <div className="w-48 h-48 bg-white/10 rounded-lg flex items-center justify-center">
                                <LoadingSpinner size="md" color="white" />
                            </div>
                        )
                    )}
                </div>

                {/* Jobs by Status */}
                <div className="card lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Jobs Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats?.jobs?.byStatus?.map((item) => (
                            <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                                <div className="text-sm text-gray-600 mt-1">{item.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                    <button
                        onClick={fetchDashboardData}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">File</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Customer</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Pages</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cost</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500">
                                        No recent activity
                                    </td>
                                </tr>
                            ) : (
                                recentActivity.map((job) => (
                                    <tr key={job.job_id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">
                                            {job.file_name || 'Unknown'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {job.customer_name || 'Guest'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {job.pages} × {job.copies}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(job.cost)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge status={job.status} />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {timeAgo(job.created_at)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Revenue</h3>
                    <div className="text-3xl font-bold text-primary-600">
                        {formatCurrency(stats?.revenue_today || 0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Total earnings</p>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Jobs</h3>
                    <div className="text-3xl font-bold text-primary-600">
                        {stats?.total_jobs_today || 0}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Total print jobs</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
