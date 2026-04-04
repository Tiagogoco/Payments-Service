import { Router } from "express";
import { createExternalPayment, createPayment, getPaymentById } from "../controllers/payment.controller.js";
import { validateOrder } from "../middleware/validateOrder.js";

const router = Router();

router.post("/payments", validateOrder, createPayment);
router.post("/payments/external", validateOrder, createExternalPayment);
router.get("/payments/:paymentId", getPaymentById);

export default router;
