import {Router} from "express";
import QRCode from "qrcode";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { getLocalIP } from "../utils/IPprovider.js";

const router = Router();

router.get("/",async (req,res)=>{
    const ssid = "Suyog-Laptop"
    const password = "12345678"
    const auth = "WPA"
    const localIP = await getLocalIP(); // your PC IP
    const port = 8000;
    const apiBaseUrl = `http://${localIP}:${port}`;

    const qrCodepayload = { ssid, password, auth, apiBaseUrl };


  try {
    const qr = await QRCode.toDataURL(JSON.stringify(qrCodepayload));
    return res.status(200).json(new ApiResponse("QR Code generated successfully", { qr},200));
  } catch (err) {
    throw new ApiError(500,"Failed to generate QR Code");
  }
})

export default router;