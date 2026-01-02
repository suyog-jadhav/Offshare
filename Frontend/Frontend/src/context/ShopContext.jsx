import React, { createContext, useState, useContext, useEffect } from 'react';
import { shopService } from '../services/api';

const ShopContext = createContext();

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) {
        throw new Error('useShop must be used within ShopProvider');
    }
    return context;
};

export const ShopProvider = ({ children }) => {
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [shopId, setShopId] = useState(localStorage.getItem('shop_id'));

    useEffect(() => {
        if (shopId) {
            fetchShop();
        } else {
            setLoading(false);
        }
    }, [shopId]);

    const fetchShop = async () => {
        try {
            const response = await shopService.get();
            setShop(response.data);
        } catch (error) {
            console.error('Error fetching shop:', error);
        } finally {
            setLoading(false);
        }
    };

    const initializeShop = async (shopData) => {
        try {
            const response = await shopService.create(shopData);
            const newShopId = response.data.id;
            localStorage.setItem('shop_id', newShopId);
            setShopId(newShopId);
            setShop(response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating shop:', error);
            throw error;
        }
    };

    const updateShop = async (shopData) => {
        try {
            await shopService.update(shopData);
            await fetchShop();
        } catch (error) {
            console.error('Error updating shop:', error);
            throw error;
        }
    };

    const value = {
        shop,
        shopId,
        loading,
        initializeShop,
        updateShop,
        refreshShop: fetchShop
    };

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
