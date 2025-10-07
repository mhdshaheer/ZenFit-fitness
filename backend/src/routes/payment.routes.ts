import { Router } from "express";
import { container } from "../inversify.config";
import { IPaymentController } from "../controllers/interface/payment.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import express from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";

const paymentRouter = Router();
const controller = container.get<IPaymentController>(TYPES.PaymentController);

paymentRouter.post("/create-checkout-session", authMiddleware, (req, res) =>
  controller.createCheckoutSession(req, res)
);
paymentRouter.get("/trainer", authMiddleware, (req, res, next) => {
  controller.getTrainerPayments(req, res).catch(next);
});
paymentRouter.get("/", authMiddleware, (req, res, next) => {
  controller.getPayment(req, res).catch(next);
});

export default paymentRouter;
