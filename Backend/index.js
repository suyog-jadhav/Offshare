import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env"
});




import { cleanupExpiredSessions } from "./src/db/crud/session.crud.js";

const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);

  // 🧹 Periodic Session Cleanup (Every 60 seconds)
  setInterval(() => {
    try {
      cleanupExpiredSessions();
      // console.log("⏰ Background cookie cleanup check ran"); // Optional log
    } catch (err) {
      console.error("Background cleanup failed:", err);
    }
  }, 60000);
});