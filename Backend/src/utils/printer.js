import { print } from "pdf-to-printer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

export const sendToPrinter = async (filePath, copies) => {
    try {
        await print(filePath, {
            copies,
            // printer: "HP_LaserJet" // optional
        });
    } catch (err) {
        throw new ApiError(500, "Printer error");
    }
};
