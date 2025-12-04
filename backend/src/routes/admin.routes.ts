import { Router } from "express";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { IAdminController } from "../controllers/interface/admin.controller.interface";
import { IAdminDashboardController } from "../controllers/interface/adminDashboard.controller.interface";

const adminRouter = Router();
const controller = container.get<IAdminController>(TYPES.AdminController);
const dashboardController = container.get<IAdminDashboardController>(
  TYPES.AdminDashboardController
);

adminRouter.use(authMiddleware);
adminRouter.use(allowRoles("admin"));
adminRouter.get("/dashboard", dashboardController.getSnapshot.bind(dashboardController));
adminRouter.get("/users", controller.getUsers.bind(controller));
adminRouter.patch(
  "/users/:id/status",
  controller.updateUserStatus.bind(controller)
);
export default adminRouter;
