import { Router } from "express";
import { container } from "../inversify.config";
import { IPaymentController } from "../controllers/interface/payment.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import express from "express";

const paymentRouter = Router();
const controller = container.get<IPaymentController>(TYPES.PaymentController);

paymentRouter.post("/create-checkout-session", (req, res) =>
  controller.createCheckoutSession(req, res)
);

paymentRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => controller.webhook(req, res)
);

export default paymentRouter;
