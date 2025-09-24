import { Router } from "express";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { IAdminController } from "../controllers/interface/admin.controller.interface";

const adminRouter = Router();
const controller = container.get<IAdminController>(TYPES.AdminController);

adminRouter.use(authMiddleware);
adminRouter.get("/users", controller.getUsers.bind(controller));
adminRouter.patch(
  "/users/:id/status",
  controller.updateUserStatus.bind(controller)
);
export default adminRouter;
