import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
    upsertPricing,
    getPricePerPage,
    getAllPricing,
    updatePricingById,
    deletePricingById
} from '../db/crud/pricing.crud.js';

//import { calculatePrintCost } from '../utils/pricing.js';

const VALID_COLOR_MODES = ['BW', 'COLOR'];
const VALID_PAPER_SIZES = ['A4', 'A3'];

/**
 * Create or Update Pricing (UPSERT)
 */
export const createPricing = asyncHandler((req, res) => {
    const { color_mode, paper_size, price_per_page } = req.body;

    if (!color_mode || !paper_size || price_per_page === undefined) {
        throw new ApiError(400, 'Missing required fields');
    }

    if (!VALID_COLOR_MODES.includes(color_mode)) {
        throw new ApiError(400, 'Invalid color_mode');
    }

    if (!VALID_PAPER_SIZES.includes(paper_size)) {
        throw new ApiError(400, 'Invalid paper_size');
    }

    if (price_per_page <= 0) {
        throw new ApiError(400, 'price_per_page must be greater than 0');
    }

    upsertPricing({ color_mode, paper_size, price_per_page });

    return res
        .status(201)
        .json(new ApiResponse('Pricing created/updated successfully', null, 201));
});

/**
 * Lookup pricing (used by mobile app)
 */
export const lookupPricing = asyncHandler((req, res) => {
    const { color_mode, paper_size } = req.query;

    if (!color_mode || !paper_size) {
        throw new ApiError(400, 'Missing required query parameters');
    }

    const pricing = getPricePerPage({ color_mode, paper_size });

    if (!pricing) {
        throw new ApiError(404, 'Pricing not found');
    }

    return res
        .status(200)
        .json(new ApiResponse('Pricing retrieved successfully', pricing, 200));
});

/**
 * Get all pricing (admin)
 */
export const getAllPricingController = asyncHandler((req, res) => {
    const pricingList = getAllPricing();

    return res
        .status(200)
        .json(new ApiResponse('All pricing retrieved successfully', pricingList, 200));
});

/**
 * Update pricing by ID
 */
export const updatePricing = asyncHandler((req, res) => {
    const { id } = req.params;
    const { price_per_page } = req.body;

    if (!id || price_per_page === undefined) {
        throw new ApiError(400, 'Missing required fields');
    }

    if (price_per_page <= 0) {
        throw new ApiError(400, 'price_per_page must be greater than 0');
    }

    const result = updatePricingById(id, price_per_page);

    if (result.changes === 0) {
        throw new ApiError(404, 'Pricing not found');
    }

    return res
        .status(200)
        .json(new ApiResponse('Pricing updated successfully', null, 200));
});

/**
 * Delete pricing
 */
export const deletePricing = asyncHandler((req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'Missing required fields');
    }

    const result = deletePricingById(id);

    if (result.changes === 0) {
        throw new ApiError(404, 'Pricing not found');
    }

    return res
        .status(200)
        .json(new ApiResponse('Pricing deleted successfully', null, 200));
});

// export const previewPricing = asyncHandler((req, res) => {
//     const { color_mode, paper_size, pages, copies } = req.query;

//     const result = calculatePrintCost({
//         color_mode,
//         paper_size,
//         pages: Number(pages),
//         copies: Number(copies)
//     });

//     res.json(new ApiResponse("Price preview", result, 200));
// });
