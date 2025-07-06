import { Router } from "express";
import { AuthController } from "../controllers/implimentation/auth.controller";
import { UserController } from "../controllers/implimentation/user.controller";

const authRouter = Router();
const controller = new AuthController();
const userController = new UserController();
authRouter.post("/signup", controller.sendOtp.bind(controller));
authRouter.post("/verify-otp", controller.verifyOtp.bind(controller));
authRouter.post("/resent-otp", controller.resendOtp.bind(controller));

authRouter.post("/login", controller.login.bind(controller));
authRouter.get("/users", userController.getAllUsers);
authRouter.patch("/users/:id/block", userController.blockUser);
authRouter.patch("/users/:id/unblock", userController.unblockUser);
export default authRouter;
