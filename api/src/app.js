import mongoose from "mongoose";
import express from "express";
import { authenticate } from "./middleware/auth.js";
import paymentRoutes from "./routes/payment.routes.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  return res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

app.use("/api", authenticate, paymentRoutes);

export default app;
