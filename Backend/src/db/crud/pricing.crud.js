import db from "../db/connection.js";

export const setPricing = (pricing) => {
    db.prepare(`
        INSERT INTO print_pricing (color_mode, paper_size, price_per_page)
        VALUES (@color_mode, @paper_size, @price_per_page)
    `).run(pricing);
};

export const getPricePerPage = ({ color_mode, paper_size }) => {
    return db.prepare(`
        SELECT price_per_page
        FROM print_pricing
        WHERE color_mode = ? AND paper_size = ?
    `).get(color_mode, paper_size);
};
