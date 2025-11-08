import { Router } from "express";
import { container } from "../inversify.config";
import { INotificationController } from "../controllers/interface/notification.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";

const notificationRouter = Router();
const controller = container.get<INotificationController>(
  TYPES.NotificationController
);

notificationRouter.use(authMiddleware);

notificationRouter.get("/", controller.getNotifications.bind(controller));
notificationRouter.patch(
  "/:notificationId/read",
  controller.markAsRead.bind(controller)
);

export default notificationRouter;
