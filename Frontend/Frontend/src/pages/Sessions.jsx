import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { sessionService } from '../services/api';
import { formatDate, timeAgo } from '../utils/helpers';

const Sessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active');

    useEffect(() => {
        fetchSessions();
    }, [filter]);

    const fetchSessions = async () => {
        try {
            const params = filter === 'all' ? {} : { active: filter === 'active' };
            const response = await sessionService.getAll(params);
            setSessions(response.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
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
            {/* Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setFilter('inactive')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'inactive' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    Inactive
                </button>
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    All
                </button>
            </div>

            {/* Sessions Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Device</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Started</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Activity</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No sessions found
                                    </td>
                                </tr>
                            ) : (
                                sessions.map((session) => (
                                    <tr key={session.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">
                                            {session.device_name || 'Unknown Device'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {session.device_type || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {formatDate(session.started_at)}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {timeAgo(session.last_activity_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${session.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {session.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Sessions;
