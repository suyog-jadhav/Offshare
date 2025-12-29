import db from "../db/connection.js";

export const createFile = (file) => {
    db.prepare(`
        INSERT INTO files (
            id, session_id, customer_id,
            original_name, stored_name,
            file_type, file_size,
            checksum, local_path
        )
        VALUES (
            @id, @session_id, @customer_id,
            @original_name, @stored_name,
            @file_type, @file_size,
            @checksum, @local_path
        )
    `).run(file);
};

export const getFilesBySession = (session_id) => {
    return db.prepare(`
        SELECT * FROM files WHERE session_id = ?
    `).all(session_id);
};

export const markFilePrinted = (id) => {
    db.prepare(`
        UPDATE files SET is_printed = 1 WHERE id = ?
    `).run(id);
};

export const deleteFileById = (id) => {
    db.prepare(`
        DELETE FROM files WHERE id = ?
    `).run(id);
};

export const getFileById = (id) => {
  return db.prepare(`SELECT * FROM files WHERE id = ?`).get(id);
};