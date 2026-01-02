import React from 'react';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
    return (
        <div className="space-y-6">
            <div className="card text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600">
                    Detailed analytics and reports will be available here
                </p>
            </div>
        </div>
    );
};

export default Analytics;
