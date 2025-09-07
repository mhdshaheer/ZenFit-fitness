import { Request, Response, Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { ProfileController } from "../controllers/implimentation/profile.controller";
import { TYPES } from "../types/inversify.types";
import { auth } from "google-auth-library";

const userRouter = Router();
const profileController = container.get<ProfileController>(
  TYPES.ProfileController
);
userRouter.get(
  "/profile",
  authMiddleware,
  profileController.getProfile.bind(profileController)
);

userRouter.put(
  "/profile",
  authMiddleware,
  profileController.updateProfile.bind(profileController)
);

userRouter.put(
  "/resume",
  authMiddleware,
  profileController.verifyResume.bind(profileController)
);

export default userRouter;
