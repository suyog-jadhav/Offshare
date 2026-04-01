import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { pricingService } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const Pricing = () => {
    const [pricing, setPricing] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        color_mode: 'BW',
        paper_size: 'A4',
        price_per_page: ''
    });

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            const response = await pricingService.getAll();
            setPricing(response.data);
        } catch (error) {
            console.error('Error fetching pricing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await pricingService.create({
                ...formData,
                price_per_page: parseFloat(formData.price_per_page)
            });
            setShowModal(false);
            setFormData({ color_mode: 'BW', paper_size: 'A4', price_per_page: '' });
            fetchPricing();
        } catch (error) {
            console.error('Error creating pricing:', error);
            alert('Failed to create pricing');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this pricing?')) return;
        try {
            await pricingService.delete(id);
            fetchPricing();
        } catch (error) {
            console.error('Error deleting pricing:', error);
            alert('Failed to delete pricing');
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
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pricing Configuration</h2>
                    <p className="text-gray-600 mt-1">Manage print pricing for different configurations</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add Pricing
                </button>
            </div>

            {/* Pricing Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {pricing.map((item) => (
                    <div key={item.id} className="card">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-sm font-medium text-gray-600">{item.color_mode}</div>
                                <div className="text-lg font-semibold text-gray-900 mt-1">{item.paper_size}</div>
                            </div>
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-700 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                        <div className="text-3xl font-bold text-primary-600">
                            {formatCurrency(item.price_per_page)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">per page</div>
                    </div>
                ))}
            </div>

            {pricing.length === 0 && (
                <div className="card text-center py-12">
                    <p className="text-gray-500">No pricing configured yet</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
                        Add Your First Pricing
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Pricing</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color Mode</label>
                                <select
                                    value={formData.color_mode}
                                    onChange={(e) => setFormData({ ...formData, color_mode: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="BW">Black & White</option>
                                    <option value="COLOR">Color</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Paper Size</label>
                                <select
                                    value={formData.paper_size}
                                    onChange={(e) => setFormData({ ...formData, paper_size: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="A4">A4</option>
                                    <option value="A3">A3</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Page (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price_per_page}
                                    onChange={(e) => setFormData({ ...formData, price_per_page: e.target.value })}
                                    required
                                    className="input-field"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="btn-primary flex-1">Add</button>
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

export default Pricing;
