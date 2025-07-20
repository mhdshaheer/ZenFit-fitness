import { Router } from "express";
import { AuthController } from "../controllers/implimentation/auth.controller";
import { AdminController } from "../controllers/implimentation/admin.controller";
import passport from "passport";
import { blockUserMiddleware } from "../middlewares/blockuser.middleware";
import { adminMiddleware } from "../middlewares/isAdmin.middleware";
import authMiddleware from "../middlewares/verifyToken.middleware";

const authRouter = Router();
const controller = new AuthController();
const userController = new AdminController();

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
authRouter.get("/users", userController.getAllUsers);
authRouter.patch("/users/:id/block", userController.blockUser);
authRouter.patch(
  "/users/:id/unblock",

  userController.unblockUser
);

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
  console.log("cookies on the route: ", req.cookies);
  res.json({ message: "Welcome to dashboard" });
});
export default authRouter;
