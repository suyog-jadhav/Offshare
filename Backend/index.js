import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env"
});





app.listen(8000, '0.0.0.0', () => {
  console.log("Server is running on port 8000");
});