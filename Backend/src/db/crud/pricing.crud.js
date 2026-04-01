import db from "../connection.js";

/**
 * Create or Update pricing (UPSERT)
 */
export const upsertPricing = ({ color_mode, paper_size, price_per_page }) => {
    db.prepare(`
        INSERT INTO print_pricing (color_mode, paper_size, price_per_page)
        VALUES (?, ?, ?)
        ON CONFLICT(color_mode, paper_size)
        DO UPDATE SET price_per_page = excluded.price_per_page
    `).run(color_mode, paper_size, price_per_page);
};

/**
 * Get price for specific configuration
 */
export const getPricePerPage = ({ color_mode, paper_size }) => {
    return db.prepare(`
        SELECT id, price_per_page
        FROM print_pricing
        WHERE color_mode = ? AND paper_size = ?
    `).get(color_mode, paper_size);
};

/**
 * Get all pricing rows
 */
export const getAllPricing = () => {
    return db.prepare(`
        SELECT * FROM print_pricing
        ORDER BY color_mode, paper_size
    `).all();
};

/**
 * Update pricing by ID
 */
export const updatePricingById = (id, price_per_page) => {
    return db.prepare(`
        UPDATE print_pricing
        SET price_per_page = ?
        WHERE id = ?
    `).run(price_per_page, id);
};

/**
 * Delete pricing by ID
 */
export const deletePricingById = (id) => {
    return db.prepare(`
        DELETE FROM print_pricing
        WHERE id = ?
    `).run(id);
};
