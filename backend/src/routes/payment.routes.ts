import { Router } from "express";
import { container } from "../inversify.config";
import { IPaymentController } from "../controllers/interface/payment.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";

const paymentRouter = Router();
const controller = container.get<IPaymentController>(TYPES.PaymentController);
paymentRouter.get(
  "/purchased-programs",
  controller.getPurchasedPrograms.bind(controller)
);

paymentRouter.post("/create-checkout-session", authMiddleware, (req, res) =>
  controller.createCheckoutSession(req, res)
);
paymentRouter.get("/trainer", authMiddleware, (req, res, next) => {
  controller.getTrainerPayments(req, res).catch(next);
});
paymentRouter.get("/", authMiddleware, (req, res, next) => {
  controller.getPayment(req, res).catch(next);
});
paymentRouter.get("/purchased/", authMiddleware, (req, res, next) => {
  controller.getPurchasedProgram(req, res).catch(next);
});
paymentRouter.get("/revenue-chart", (req, res, next) => {
  controller.getRevenueChart(req, res).catch(next);
});
paymentRouter.get("/revenue-chart/trainer", (req, res, next) => {
  controller.getRevenueChartByTrainer(req, res).catch(next);
});
paymentRouter.get("/top-categories", authMiddleware, (req, res, next) => {
  controller.getTopSellingCategories(req, res).catch(next);
});
paymentRouter.get(
  "/top-categories/trainer",
  authMiddleware,
  (req, res, next) => {
    controller.getTopSellingCategoriesByTrainer(req, res).catch(next);
  }
);
paymentRouter.get("/top-programs", authMiddleware, (req, res, next) => {
  controller.getTopSellingPrograms(req, res).catch(next);
});
paymentRouter.get("/top-programs/trainer", authMiddleware, (req, res, next) => {
  controller.getTopSellingProgramsByTrainer(req, res).catch(next);
});
paymentRouter.get("/entrolled/:programId", authMiddleware, (req, res, next) => {
  controller.getEntrolledUsers(req, res).catch(next);
});

export default paymentRouter;
