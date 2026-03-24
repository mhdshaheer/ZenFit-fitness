import { Router } from "express";
import passport from "passport";
import { env } from "../config/env.config";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { IAuthController } from "../controllers/interface/auth.controller.interface";

const authRouter = Router();
const controller = container.get<IAuthController>(TYPES.AuthController);

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
  controller.verifyForgotOtp.bind(controller)
);
authRouter.post("/reset-password", controller.resetPassword.bind(controller));

authRouter.post("/login", controller.login.bind(controller));

// Google signup

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRouter.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err: any, user: any, info: any) => {
      if (err) {
        // Here we handle the specific error from handleGoogleLogin
        const errorMessage = encodeURIComponent(err.message || "Google authentication failed");
        return res.redirect(`${env.frontend_url}/auth/login?error=${errorMessage}`);
      }
      if (!user) {
        const infoMessage = info ? encodeURIComponent(info.message || "User not found") : "Authentication failed";
        return res.redirect(`${env.frontend_url}/auth/login?error=${infoMessage}`);
      }
      // If successful, we attach the user to req and proceed to the controller
      req.user = user;
      next();
    })(req, res, next);
  },
  controller.googleCallback.bind(controller)
);

// Private Routes
authRouter.get("/", authMiddleware, (req, res, next) => {
  controller.getUserId(req, res).catch(next);
});
authRouter.get("/protected", authMiddleware, (_req, res) => {
  res.json({ message: "Welcome to dashboard" });
});
authRouter.post(
  "/refresh-token",
  controller.refreshAccessToken.bind(controller)
);
authRouter.post("/logout", controller.logOut.bind(controller));

export default authRouter;
