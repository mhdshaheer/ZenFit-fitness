import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { ProfileController } from "../controllers/implimentation/profile.controller";
import { TYPES } from "../shared/types/inversify.types";

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

userRouter.post(
  "/password",
  authMiddleware,
  profileController.changePassword.bind(profileController)
);

// userRouter.delete("/resume",authMiddleware,profileController.)

export default userRouter;
