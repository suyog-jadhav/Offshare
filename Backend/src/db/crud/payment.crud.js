import db from "../connection.js";

export const createPayment = (payment) => {
    db.prepare(`
        INSERT INTO payments (
            id, print_job_id, method, amount, status
        )
        VALUES (
            @id, @print_job_id, @method, @amount, 'PAID'
        )
    `).run(payment);
};

export const getPaymentsByJob = (print_job_id) => {
    return db.prepare(`
        SELECT * FROM payments WHERE print_job_id = ?
    `).get(print_job_id);
};
