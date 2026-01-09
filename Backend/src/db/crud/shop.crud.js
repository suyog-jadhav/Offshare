import db from "../connection.js";

export const createShopInDB = (shop) => {
    db.prepare(`
        INSERT INTO shop (id, name, owner_name, phone, address, local_ip)
        VALUES (@id, @name, @owner_name, @phone, @address, @local_ip)
    `).run(shop);
};

export const getShopFromDB = () => {
    return db.prepare(`SELECT * FROM shop LIMIT 1`).get();
};

export const updateShopInDB = (shop) => {
    db.prepare(`
        UPDATE shop SET
            name = @name,
            owner_name = @owner_name,
            phone = @phone,
            address = @address,
            local_ip = @local_ip
        WHERE id = @id
    `).run(shop);
};

export const deleteShopFromDB = () => {
    return db.prepare(`DELETE FROM shop`).run();
};
