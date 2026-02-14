import express from "express";
import paymentRoutes from "./routes/payment.routes.js";
const app = express();

app.use(express.json());

// Rutas
app.use("/api", paymentRoutes);

export default app;
