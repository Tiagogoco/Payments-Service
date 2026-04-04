import mongoose from "mongoose";
import Payment from "../models/payment.model.js";

const ALLOWED_INTERNAL = new Set(["card", "cash"]);
const ALLOWED_EXTERNAL = new Set(["paypal"]);

const toPaymentResponse = (payment) => ({
  id: String(payment._id),
  orderId: payment.orderId,
  amount: payment.amount,
  currency: payment.currency,
  method: payment.method,
  status: payment.status,
  provider: payment.provider,
  providerReference: payment.providerReference ?? null,
  idempotencyKey: payment.idempotencyKey,
  message: payment.message ?? null,
  createdAt: payment.createdAt,
});

const validateBasePayload = ({ orderId, amount, currency }, res) => {
  if (!orderId || typeof orderId !== "string") {
    res.status(400).json({ error: "BadRequest", message: "orderId is required" });
    return false;
  }

  if (Number.isNaN(Number(amount)) || Number(amount) <= 0) {
    res.status(400).json({ error: "BadRequest", message: "amount must be greater than 0" });
    return false;
  }

  if (!currency || typeof currency !== "string" || currency.length !== 3) {
    res.status(400).json({ error: "BadRequest", message: "currency must be a 3-letter code" });
    return false;
  }

  return true;
};

export const createPayment = async (req, res) => {
  const idempotencyKey = req.get("Idempotency-Key");
  if (!idempotencyKey) {
    return res.status(400).json({ error: "BadRequest", message: "Idempotency-Key header is required" });
  }

  const { orderId, amount, method, currency } = req.body;

  if (!validateBasePayload({ orderId, amount, currency }, res)) return;

  if (!ALLOWED_INTERNAL.has(method)) {
    return res.status(400).json({ error: "BadRequest", message: "method is not allowed for internal payments" });
  }

  const doc = await Payment.findOneAndUpdate(
    { idempotencyKey },
    {
      $setOnInsert: {
        orderId,
        amount: Number(amount),
        method,
        currency: currency.toUpperCase(),
        status: "approved",
        provider: "internal",
        providerReference: null,
        idempotencyKey,
        message: "Payment approved",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const isNew = doc.createdAt.getTime() === doc.updatedAt?.getTime?.() || true;
  return res.status(201).json(toPaymentResponse(doc));
};

export const createExternalPayment = async (req, res) => {
  const idempotencyKey = req.get("Idempotency-Key");
  if (!idempotencyKey) {
    return res.status(400).json({ error: "BadRequest", message: "Idempotency-Key header is required" });
  }

  const { orderId, amount, method, currency, provider } = req.body;

  if (!validateBasePayload({ orderId, amount, currency }, res)) return;

  if (!ALLOWED_EXTERNAL.has(method) || provider !== "paypal") {
    return res.status(400).json({ error: "BadRequest", message: "method is not allowed for external payments" });
  }

  const doc = await Payment.findOneAndUpdate(
    { idempotencyKey },
    {
      $setOnInsert: {
        orderId,
        amount: Number(amount),
        method,
        currency: currency.toUpperCase(),
        status: "approved",
        provider,
        providerReference: `PAYPAL-${Date.now()}`,
        idempotencyKey,
        message: "Approved by PayPal",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json(toPaymentResponse(doc));
};

export const getPaymentById = async (req, res) => {
  const { paymentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(paymentId)) {
    return res.status(404).json({ error: "NotFound", message: "paymentId does not exist" });
  }

  const payment = await Payment.findById(paymentId).lean();

  if (!payment) {
    return res.status(404).json({ error: "NotFound", message: "paymentId does not exist" });
  }

  return res.status(200).json(toPaymentResponse(payment));
};
