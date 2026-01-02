import React, { useState, useEffect } from 'react';
import { DollarSign, Printer, Users, Wifi } from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { dashboardService } from '../services/api';
import { formatCurrency, formatDate, timeAgo } from '../utils/helpers';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, activityRes] = await Promise.all([
                dashboardService.getStats(),
                dashboardService.getRecentActivity(10)
            ]);
            setStats(statsRes.data);
            setRecentActivity(activityRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Revenue"
                    value={formatCurrency(stats?.revenue?.today || 0)}
                    icon={DollarSign}
                    color="success"
                />
                <StatCard
                    title="Today's Jobs"
                    value={stats?.jobs?.today || 0}
                    icon={Printer}
                    color="primary"
                />
                <StatCard
                    title="Total Customers"
                    value={stats?.customers?.total || 0}
                    icon={Users}
                    color="info"
                />
                <StatCard
                    title="Active Sessions"
                    value={stats?.sessions?.active || 0}
                    icon={Wifi}
                    color="warning"
                />
            </div>

            {/* Jobs by Status */}
            <div className="card">
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
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Pages</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cost</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No recent activity
                                    </td>
                                </tr>
                            ) : (
                                recentActivity.map((job) => (
                                    <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">
                                            {job.file_name || 'Unknown'}
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
                        {formatCurrency(stats?.revenue?.total || 0)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">All time earnings</p>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Jobs</h3>
                    <div className="text-3xl font-bold text-primary-600">
                        {stats?.jobs?.total || 0}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">All time print jobs</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
