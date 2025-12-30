import { getPricePerPage } from "../db/crud/pricing.crud.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Calculates total cost for a print job
 * This is the SINGLE source of truth for pricing logic
 */
export const calculatePrintCost = ({
    color_mode,
    paper_size,
    pages,
    copies
}) => {
    if (pages <= 0 || copies <= 0) {
        throw new ApiError(400, "Invalid pages or copies");
    }

    const pricing = getPricePerPage({ color_mode, paper_size });

    if (!pricing) {
        throw new ApiError(404, "Pricing not configured");
    }

    const price_per_page = pricing.price_per_page;
    const cost = pages * copies * price_per_page;

    return {
        price_per_page,
        cost
    };
};
