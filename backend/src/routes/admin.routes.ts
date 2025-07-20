import { Router } from "express";
import { AdminController } from "../controllers/implimentation/admin.controller";

const adminRouter = Router();
const controller = new AdminController();

// adminRouter.patch("/users/:id/status", controller.updateUserStatus.bind(controller));
export default adminRouter;
