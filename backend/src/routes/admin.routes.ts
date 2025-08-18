import { Router } from "express";
import { AdminController } from "../controllers/implimentation/admin.controller";
import { container } from "../inversify.config";
import { TYPES } from "../types/inversify.types";

const adminRouter = Router();
const controller = container.get<AdminController>(TYPES.AdminController);

adminRouter.get("/users", controller.getUsers.bind(controller));
adminRouter.patch(
  "/users/:id/status",
  controller.updateUserStatus.bind(controller)
);
export default adminRouter;
