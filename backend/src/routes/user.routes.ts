import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { IProfileController } from "../controllers/interface/profile.controller.interface";

const userRouter = Router();
const profileController = container.get<IProfileController>(
  TYPES.ProfileController
);

userRouter.use(authMiddleware);

userRouter.get(
  "/profile",
  profileController.getProfile.bind(profileController)
);

userRouter.put(
  "/profile",
  profileController.updateProfile.bind(profileController)
);

userRouter.put(
  "/resume",
  profileController.verifyResume.bind(profileController)
);

userRouter.post(
  "/password",
  profileController.changePassword.bind(profileController)
);

// userRouter.delete("/resume",authMiddleware,profileController.)

export default userRouter;
