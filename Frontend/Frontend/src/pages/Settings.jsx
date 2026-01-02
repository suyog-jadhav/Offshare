import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const Settings = () => {
    const { shop, updateShop } = useShop();
    const [formData, setFormData] = useState({
        name: shop?.name || '',
        owner_name: shop?.owner_name || '',
        phone: shop?.phone || '',
        address: shop?.address || ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            await updateShop(formData);
            setMessage('Settings saved successfully!');
        } catch (error) {
            setMessage('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-2xl">
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Shop Settings</h3>

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
                        />
                    </div>

                    {message && (
                        <div className={`p-3 rounded-lg text-sm ${message.includes('success')
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>

            <div className="card mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Information</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Shop ID:</span>
                        <span className="font-mono text-gray-900">{shop?.id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Local IP:</span>
                        <span className="font-mono text-gray-900">{shop?.local_ip || 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
