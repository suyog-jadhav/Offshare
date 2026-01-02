import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const Setup = () => {
    const { initializeShop } = useShop();
    const [formData, setFormData] = useState({
        name: '',
        owner_name: '',
        phone: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await initializeShop(formData);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to setup shop');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome to Offshare</h1>
                    <p className="text-gray-600 mt-2">Set up your xerox shop to get started</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Shop Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="input-field"
                                placeholder="Enter shop name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Owner Name
                            </label>
                            <input
                                type="text"
                                name="owner_name"
                                value={formData.owner_name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter owner name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter phone number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="3"
                                className="input-field"
                                placeholder="Enter shop address"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Setting up...' : 'Setup Shop'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Setup;
