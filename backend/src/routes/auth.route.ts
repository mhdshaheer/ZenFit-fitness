import { Router } from "express";
import { AuthController } from "../controllers/implimentation/auth.controller";
import passport from "passport";
import { blockUserMiddleware } from "../middlewares/blockuser.middleware";
import { adminMiddleware } from "../middlewares/isAdmin.middleware";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../types/inversify.types";

const authRouter = Router();
// const controller = new AuthController();
const controller = container.get<AuthController>(TYPES.AuthController);

authRouter.post("/signup", controller.sendOtp.bind(controller));
authRouter.post(
  "/verify-otp",
  // verifyToken,
  controller.verifyOtp.bind(controller)
);
authRouter.post("/resent-otp", controller.resendOtp.bind(controller));
authRouter.post("/send-otp", controller.sendForgotPasswordOtp.bind(controller));
authRouter.post(
  "/verify-forgot-otp",
  controller.sendForgotPasswordOtp.bind(controller)
);
authRouter.post(
  "/reset-password",
  controller.sendForgotPasswordOtp.bind(controller)
);

authRouter.post("/login", controller.login.bind(controller));
authRouter.post("/logout", controller.logOut.bind(controller));

// Google signup

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  controller.googleCallback
);

authRouter.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Welcome to dashboard" });
});
authRouter.post(
  "/refresh-token",
  controller.refreshAccessToken.bind(controller)
);

export default authRouter;
