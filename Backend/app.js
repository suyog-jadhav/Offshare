import express from "express";
import cors from "cors";

/* DB INIT */
import "./src/db/schema.js";

/* ROUTES */
import shopRouter from "./src/routes/shop.routes.js";
import sessionRouter from "./src/routes/session.routes.js";
import fileRouter from "./src/routes/files.routes.js";
import printRouter from "./src/routes/print.routes.js";
import pricingRouter from "./src/routes/pricing.routes.js";
import dashboardRouter from "./src/routes/dashboard.routes.js";
import systemRouter from "./src/routes/system.routes.js";
import qrRouter from "./src/routes/qr.routes.js";
import customerRouter from "./src/routes/customer.routes.js";

/* ERROR HANDLER */
import { ApiError } from "./src/utils/ApiError.js";

const app = express();

/* MIDDLEWARES */
app.use(cors(
  {
    origin: "*"
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ROOT / HEALTH */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Offshare backend running"
  });
});

/* ROUTE MOUNTING */
app.use("/api/shop", shopRouter);
app.use("/api/session", sessionRouter);
app.use("/api/files", fileRouter);
app.use("/api/print", printRouter);
app.use("/api/pricing", pricingRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/system", systemRouter);
app.use("/api/qr", qrRouter);
app.use("/api/customer",customerRouter);

/* GLOBAL ERROR HANDLER */
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  console.error("Unhandled Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

export default app;
