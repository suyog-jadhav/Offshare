import { Router } from "express";
import QRCode from "qrcode";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getLocalIP } from "../utils/IPprovider.js";
import { getShopFromDB } from "../db/crud/shop.crud.js";

const router = Router();

router.get("/", async (req, res) => {
  let { ssid, password, auth } = req.query;

  // Persistence: fallback to DB if not provided
  try {
    if (!ssid) {
      const shop = await getShopFromDB();
      if (shop) {
        ssid = shop.wifi_ssid;
        password = shop.wifi_password;
        auth = shop.wifi_auth;
      }
    }
  } catch (e) {
    console.warn("DB lookup failed for QR, using query params only");
  }

  const localIP = await getLocalIP();
  const port = 8000;
  const apiBaseUrl = `http://${localIP}:${port}`;

  // STRICT PAYLOAD: Matches user's exact request
  const qrCodepayload = {
    ssid: ssid || '',
    password: password || '',
    auth: auth || 'WPA',
    apiBaseUrl: apiBaseUrl
  };

  console.log("📱 Generating QR:", JSON.stringify(qrCodepayload));

  try {
    const qr = await QRCode.toDataURL(JSON.stringify(qrCodepayload));
    return res.status(200).json(new ApiResponse("QR Code generated successfully", { qr }, 200));
  } catch (err) {
    console.error("QR Gen Error:", err);
    throw new ApiError(500, "Failed to generate QR Code");
  }
});

export default router;