import express from "express";
import offlineUploadRouter from "./src/routes/offlineUpload.routes.js";
import qrRouter from "./src/routes/qr.routes.js";
import shopRouter from "./src/routes/shop.routes.js";
import cors from "cors";
import  "./src/db/schema.js";




const app = express();
app.use(express.json()); // for JSON bodies
app.use(express.urlencoded({ extended: true })); // for form data
app.use(cors());
app.use("/shop", shopRouter);
//app.use("/qr", qrRouter);
//app.use("/upload", offlineUploadRouter);

export default app;