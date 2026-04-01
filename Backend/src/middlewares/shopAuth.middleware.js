import { ApiError } from "../utils/ApiError.js";

export const verifyShopAuth = (req, res, next) => {
    const shopToken = req.headers["x-shop-token"];
    console.log(`🔐 Auth Check: ${req.method} ${req.url}`);
    console.log(`   Tokens -> Header: ${shopToken} | Env: ${process.env.SHOP_TOKEN}`);

    if (!shopToken) {
        throw new ApiError(401, "Shop authentication token missing");
    }

    if (shopToken !== process.env.SHOP_TOKEN) {
        throw new ApiError(403, "Invalid shop token");
    }

    return next();
};
