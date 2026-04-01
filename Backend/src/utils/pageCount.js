import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";
import mammoth from "mammoth";
import { ApiError } from "../utils/ApiError.js";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

/**
 * Detect file extension
 */
const getExtension = (filePath) =>
    path.extname(filePath).toLowerCase();

/**
 * Calculate number of pages for a file
 */
export const calculatePageCount = async (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new ApiError(404, "File not found");
    }

    const ext = getExtension(filePath);

    /* ---------- PDF ---------- */
    if (ext === ".pdf") {
        const data = fs.readFileSync(filePath);
        const pdf = await PDFDocument.load(data);
        return pdf.getPageCount();
    }

    /* ---------- IMAGES ---------- */
    if (IMAGE_EXTENSIONS.includes(ext)) {
        // validate image
        await sharp(filePath).metadata();
        return 1;
    }

    /* ---------- DOCX ---------- */
    if (ext === ".docx") {
        const result = await mammoth.extractRawText({ path: filePath });
        const textLength = result.value.length;

        // Rough estimation: ~1800 chars per page
        return Math.max(1, Math.ceil(textLength / 1800));
    }

    throw new ApiError(400, "Unsupported file type");
};
