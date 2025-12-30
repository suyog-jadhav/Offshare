export const createPrintJob = (job) => {
    db.prepare(`
        INSERT INTO print_jobs (
            id, file_id, settings_id,
            pages, copies, price_per_page,
            cost, status
        )
        VALUES (
            @id, @file_id, @settings_id,
            @pages, @copies, @price_per_page,
            @cost, 'PENDING'
        )
    `).run(job);
};

export const markJobPrinted = (id) => {
    return db.prepare(`
        UPDATE print_jobs
        SET status = 'PRINTED', printed_at = CURRENT_TIMESTAMP
        WHERE id = ? AND status = 'PENDING'
    `).run(id);
};

export const cancelPrintJob = (id) => {
    return db.prepare(`
        UPDATE print_jobs
        SET status = 'CANCELLED'
        WHERE id = ? AND status = 'PENDING'
    `).run(id);
};

export const failPrintJob = (id) => {
    return db.prepare(`
        UPDATE print_jobs
        SET status = 'FAILED'
        WHERE id = ? AND status = 'PENDING'
    `).run(id);
};

export const getJobsBySession = (session_id) => {
    return db.prepare(`
        SELECT pj.*
        FROM print_jobs pj
        JOIN files f ON pj.file_id = f.id
        WHERE f.session_id = ?
        ORDER BY pj.created_at DESC
    `).all(session_id);
};
