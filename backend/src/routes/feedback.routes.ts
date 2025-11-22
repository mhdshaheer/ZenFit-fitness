import { Router } from "express";
import { container } from "../inversify.config";
import { IFeedbackController } from "../controllers/interface/feedback.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";

const feedbackRouter = Router();
const controller = container.get<IFeedbackController>(
  TYPES.FeedbackController
);

feedbackRouter.use(authMiddleware);

// Create or update feedback (trainer only)
feedbackRouter.post("/", controller.createOrUpdateFeedback.bind(controller));

// Get feedback by slot and date
feedbackRouter.get("/", controller.getFeedbackBySlotAndDate.bind(controller));

// Get all feedbacks for a slot
feedbackRouter.get("/:slotId", controller.getFeedbacksBySlotId.bind(controller));

// Delete feedback (trainer only)
feedbackRouter.delete("/", controller.deleteFeedback.bind(controller));

export default feedbackRouter;
