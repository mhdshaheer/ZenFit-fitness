import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { IProfileController } from "../controllers/interface/profile.controller.interface";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const userRouter = Router();
const profileController = container.get<IProfileController>(
  TYPES.ProfileController
);

userRouter.use(authMiddleware);

userRouter.get(
  "/profile",
  adaptHandler(profileController.getProfile.bind(profileController))
);

userRouter.get(
  "/current",
  adaptHandler(profileController.getCurrentUserId.bind(profileController))
);

userRouter.put(
  "/profile",
  adaptHandler(profileController.updateProfile.bind(profileController))
);

userRouter.put(
  "/resume",
  adaptHandler(profileController.verifyResume.bind(profileController))
);

userRouter.post(
  "/password",
  adaptHandler(profileController.changePassword.bind(profileController))
);

// userRouter.delete("/resume",authMiddleware,profileController.)

userRouter.get(
  "/:userId",
  adaptHandler(profileController.getUserByUserId.bind(profileController))
);
export default userRouter;
