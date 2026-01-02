import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { printService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PRINT_STATUS } from '../utils/constants';

const PrintJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    const fetchJobs = async () => {
        try {
            const params = filter ? { status: filter } : {};
            const response = await printService.getAllJobs(params);
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (jobId, action) => {
        try {
            if (action === 'print') {
                await printService.printJob(jobId);
            } else if (action === 'cancel') {
                await printService.cancelJob(jobId);
            }
            fetchJobs();
        } catch (error) {
            console.error(`Error ${action}ing job:`, error);
            alert(`Failed to ${action} job`);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.file_name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by file name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === '' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        All
                    </button>
                    {Object.values(PRINT_STATUS).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">File</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Pages</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Settings</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cost</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-8 text-gray-500">
                                        No print jobs found
                                    </td>
                                </tr>
                            ) : (
                                filteredJobs.map((job) => (
                                    <tr key={job.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">
                                            {job.file_name || 'Unknown'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {job.pages} × {job.copies}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {job.color_mode} / {job.paper_size}
                                        </td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(job.cost)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge status={job.status} />
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {formatDate(job.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                {job.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(job.id, 'print')}
                                                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                                                        >
                                                            Print
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(job.id, 'cancel')}
                                                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                )}
                                            </div>
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

export default PrintJobs;
