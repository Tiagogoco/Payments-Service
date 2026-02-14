import { Router } from "express";
import {
  createExternalPayment,
  createPayment,
  getPaymentById,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/payments", createPayment);
router.post("/payments/external", createExternalPayment);
router.get("/payments/:paymentId", getPaymentById);

export default router;
