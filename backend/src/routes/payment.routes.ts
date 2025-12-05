import { Router } from "express";
import { container } from "../inversify.config";
import { IPaymentController } from "../controllers/interface/payment.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const paymentRouter = Router();
const controller = container.get<IPaymentController>(TYPES.PaymentController);
paymentRouter.get(
  "/purchased-programs",
  authMiddleware,
  adaptHandler(controller.getPurchasedPrograms.bind(controller))
);
paymentRouter.get(
  "/trainer/purchased-programs",
  authMiddleware,
  adaptHandler(controller.getTrainerPurchasedPrograms.bind(controller))
);

paymentRouter.post(
  "/create-checkout-session",
  authMiddleware,
  adaptHandler(controller.createCheckoutSession.bind(controller))
);
paymentRouter.get(
  "/trainer",
  authMiddleware,
  adaptHandler(controller.getTrainerPayments.bind(controller))
);
paymentRouter.get(
  "/",
  authMiddleware,
  adaptHandler(controller.getPayment.bind(controller))
);
paymentRouter.get(
  "/purchased/",
  authMiddleware,
  adaptHandler(controller.getPurchasedProgram.bind(controller))
);
paymentRouter.get(
  "/user/transaction-history",
  authMiddleware,
  adaptHandler(controller.getUserTransactionHistory.bind(controller))
);
paymentRouter.get(
  "/revenue-chart",
  adaptHandler(controller.getRevenueChart.bind(controller))
);
paymentRouter.get(
  "/revenue-chart/trainer",
  adaptHandler(controller.getRevenueChartByTrainer.bind(controller))
);
paymentRouter.get(
  "/top-categories",
  authMiddleware,
  adaptHandler(controller.getTopSellingCategories.bind(controller))
);
paymentRouter.get(
  "/top-categories/trainer",
  authMiddleware,
  adaptHandler(controller.getTopSellingCategoriesByTrainer.bind(controller))
);
paymentRouter.get(
  "/top-programs",
  authMiddleware,
  adaptHandler(controller.getTopSellingPrograms.bind(controller))
);
paymentRouter.get(
  "/top-programs/trainer",
  authMiddleware,
  adaptHandler(controller.getTopSellingProgramsByTrainer.bind(controller))
);
paymentRouter.get(
  "/entrolled/:programId",
  authMiddleware,
  adaptHandler(controller.getEntrolledUsers.bind(controller))
);

export default paymentRouter;
