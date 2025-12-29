import db from "../db/connection.js";

export const createPrintSettings = (settings) => {
    db.prepare(`
        INSERT INTO print_settings (
            id, color_mode, copies, paper_size, sides, orientation
        )
        VALUES (
            @id, @color_mode, @copies,
            @paper_size, @sides, @orientation
        )
    `).run(settings);
};

/* =========================
   READ (by id)
========================= */
export const getPrintSettingsById = (id) => {
  return db.prepare(`
    SELECT *
    FROM print_settings
    WHERE id = ?
  `).get(id);
};

/* =========================
   READ (by session)
========================= */
export const getPrintSettingsBySession = (session_id) => {
  return db.prepare(`
    SELECT *
    FROM print_settings
    WHERE session_id = ?
    ORDER BY created_at DESC
  `).all(session_id);
};

/* =========================
   UPDATE
========================= */
export const updatePrintSettings = (settings) => {
  return db.prepare(`
    UPDATE print_settings
    SET
      color_mode   = @color_mode,
      copies       = @copies,
      paper_size   = @paper_size,
      sides        = @sides,
      orientation  = @orientation
    WHERE id = @id
  `).run(settings);
};

/* =========================
   DELETE
========================= */
export const deletePrintSettings = (id) => {
  return db.prepare(`
    DELETE FROM print_settings
    WHERE id = ?
  `).run(id);
};
