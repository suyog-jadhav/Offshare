import React, { useState, useEffect } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { DollarSign, Printer, Users, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyticsService } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [fileTypeData, setFileTypeData] = useState([]);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const [overviewRes, revenueRes, statusRes, fileRes] = await Promise.all([
                analyticsService.getOverview(),
                analyticsService.getRevenueChart(),
                analyticsService.getStatusDistribution(),
                analyticsService.getFileTypeDistribution()
            ]);

            setOverview(overviewRes.data);
            setRevenueData(revenueRes.data);
            setStatusData(statusRes.data);
            setFileTypeData(fileRes.data);
            console.log("✅ Analytics Data Loaded:", { overview: overviewRes.data, revenue: revenueRes.data });
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
                <button
                    onClick={fetchAnalytics}
                    className="px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium text-sm"
                >
                    Refresh Data
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={formatCurrency(overview?.totalRevenue || 0)}
                    icon={DollarSign}
                    color="success"
                />
                <StatCard
                    title="Total Jobs"
                    value={overview?.totalJobs || 0}
                    icon={Printer}
                    color="primary"
                />
                <StatCard
                    title="Total Customers"
                    value={overview?.totalCustomers || 0}
                    icon={Users}
                    color="info"
                />
                <StatCard
                    title="Avg Order Value"
                    value={formatCurrency(overview?.avgOrderValue || 0)}
                    icon={TrendingUp}
                    color="warning"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Trend - Main Chart */}
                <div className="card lg:col-span-2 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend (Last 30 Days)</h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Job Status Distribution */}
                <div className="card min-h-[400px]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Status</h3>
                    <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="status"
                                    label
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* File Types */}
                <div className="card min-h-[350px]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular File Types</h3>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={fileTypeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="file_type" type="category" width={80} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card min-h-[350px] flex flex-col justify-center items-center text-center p-8 bg-gray-50 border-dashed border-2 border-gray-200">
                    <div className="p-4 bg-white rounded-full mb-4 shadow-sm">
                        <TrendingUp size={32} className="text-primary-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Pro Tips</h3>
                    <p className="text-gray-600 mt-2 max-w-sm">
                        Track your daily revenue trends to identify peak business hours.
                        Monitor file types to ensure you have enough paper supply for different print needs.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
