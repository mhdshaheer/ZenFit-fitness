import { Router } from "express";
import { TrainerAuthController } from "../controllers/implimentation/trainer-auth.controller";

const trainerAuthRouter = Router();
const controller = new TrainerAuthController();
trainerAuthRouter.post("/send-otp", controller.sendOtp.bind(controller));
trainerAuthRouter.post("/verify-otp", controller.verifyOtp.bind(controller));

export default trainerAuthRouter;
