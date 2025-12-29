import db from "../db/connection.js";

export const createCustomer = (customer) => {
    db.prepare(`
        INSERT INTO customers (id, name, phone, is_guest)
        VALUES (@id, @name, @phone, @is_guest)
    `).run(customer);
};

export const getCustomerById = (id) => {
    return db.prepare(`SELECT * FROM customers WHERE id = ?`).get(id);
};
export const getCustomerByPhone = (phone) => {
  return db
    .prepare(`SELECT * FROM customers WHERE phone = ?`)
    .get(phone);
};
