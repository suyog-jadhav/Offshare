import React from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const Header = ({ title }) => {
    const { shop } = useShop();

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {shop?.owner_name && `Managed by ${shop.owner_name}`}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-semibold">
                                {shop?.name?.charAt(0) || 'S'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
