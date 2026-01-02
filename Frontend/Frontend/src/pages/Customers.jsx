import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { customerService } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await customerService.getAll();
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await customerService.update(editingId, formData);
            } else {
                await customerService.create(formData);
            }
            setShowModal(false);
            setFormData({ name: '', phone: '' });
            setEditingId(null);
            fetchCustomers();
        } catch (error) {
            console.error('Error saving customer:', error);
            alert('Failed to save customer');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this customer?')) return;
        try {
            await customerService.delete(id);
            fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('Failed to delete customer');
        }
    };

    const handleEdit = (customer) => {
        setFormData({ name: customer.name, phone: customer.phone });
        setEditingId(customer.id);
        setShowModal(true);
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
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
                        placeholder="Search customers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <button
                    onClick={() => {
                        setFormData({ name: '', phone: '' });
                        setEditingId(null);
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Customer
                </button>
            </div>

            {/* Customers Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Name</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Phone</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Jobs</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total Spent</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-gray-900">{customer.name}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{customer.phone || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-gray-600">{customer.total_jobs || 0}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                            {formatCurrency(customer.total_spent || 0)}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(customer)}
                                                    className="p-1 text-blue-600 hover:text-blue-700"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="p-1 text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingId ? 'Edit Customer' : 'Add Customer'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    className="input-field"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn-primary flex-1">
                                    {editingId ? 'Update' : 'Add'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
