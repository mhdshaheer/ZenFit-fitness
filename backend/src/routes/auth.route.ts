import { Router } from "express";
import { AuthController } from "../controllers/implimentation/auth.controller";

const authRouter = Router();
const controller = new AuthController();
authRouter.post("/send-otp", controller.sendOtp.bind(controller));
authRouter.post("/verify-otp", controller.verifyOtp.bind(controller));
export default authRouter;
