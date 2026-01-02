import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useShop } from './context/ShopContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PrintJobs from './pages/PrintJobs';
import Sessions from './pages/Sessions';
import Customers from './pages/Customers';
import Pricing from './pages/Pricing';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Setup from './pages/Setup';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
    const { shop, shopId, loading } = useShop();

    if (loading) {
        return <LoadingSpinner fullPage />;
    }

    if (!shopId || !shop) {
        return <Setup />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="jobs" element={<PrintJobs />} />
                    <Route path="sessions" element={<Sessions />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="pricing" element={<Pricing />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
