import app from "./app.js";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env"
});




const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});