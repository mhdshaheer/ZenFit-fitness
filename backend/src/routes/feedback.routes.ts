import { Router } from "express";
import { container } from "../inversify.config";
import { IFeedbackController } from "../controllers/interface/feedback.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const feedbackRouter = Router();
const controller = container.get<IFeedbackController>(
  TYPES.FeedbackController
);

feedbackRouter.use(authMiddleware);

// Create or update feedback (trainer only)
feedbackRouter.post(
  "/",
  adaptHandler(controller.createOrUpdateFeedback.bind(controller))
);

// Get feedback by slot and date
feedbackRouter.get(
  "/",
  adaptHandler(controller.getFeedbackBySlotAndDate.bind(controller))
);

// Get all feedbacks for a slot
feedbackRouter.get(
  "/:slotId",
  adaptHandler(controller.getFeedbacksBySlotId.bind(controller))
);

// Delete feedback (trainer only)
feedbackRouter.delete(
  "/",
  adaptHandler(controller.deleteFeedback.bind(controller))
);

export default feedbackRouter;
