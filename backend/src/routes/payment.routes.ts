import { Router } from "express";
import { container } from "../inversify.config";
import { IPaymentController } from "../controllers/interface/payment.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import express from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";

const paymentRouter = Router();
const controller = container.get<IPaymentController>(TYPES.PaymentController);

// paymentRouter.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   (req, res) => controller.webhook(req, res)
// );

paymentRouter.post("/create-checkout-session", authMiddleware, (req, res) =>
  controller.createCheckoutSession(req, res)
);

export default paymentRouter;
