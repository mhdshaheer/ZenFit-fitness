import { Router } from "express";
import { container } from "../inversify.config";
import { INotificationController } from "../controllers/interface/notification.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const notificationRouter = Router();
const controller = container.get<INotificationController>(
  TYPES.NotificationController
);

notificationRouter.use(authMiddleware);

notificationRouter.get(
  "/",
  adaptHandler(controller.getNotifications.bind(controller))
);
notificationRouter.patch(
  "/:notificationId/read",
  adaptHandler(controller.markAsRead.bind(controller))
);
notificationRouter.patch(
  "/mark-all-read",
  adaptHandler(controller.markAllAsRead.bind(controller))
);

export default notificationRouter;
