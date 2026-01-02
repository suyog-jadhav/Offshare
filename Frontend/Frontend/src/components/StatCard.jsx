import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary-50 text-primary-600',
        success: 'bg-green-50 text-green-600',
        warning: 'bg-yellow-50 text-yellow-600',
        danger: 'bg-red-50 text-red-600',
        info: 'bg-blue-50 text-blue-600'
    };

    return (
        <div className="card hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>

                    {trend && (
                        <div className="flex items-center gap-1 mt-2">
                            {trend === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {trendValue}
                            </span>
                        </div>
                    )}
                </div>

                {Icon && (
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
