import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { ISlotInstanceController } from "../controllers/interface/slotInstance.controller.interface";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const slotInstanceRouter = Router();
const controller = container.get<ISlotInstanceController>(
    TYPES.SlotInstanceController
);

// Public endpoint for users to fetch program-specific instances
slotInstanceRouter.get(
    "/public/program",
    adaptHandler(controller.getInstancesForProgram.bind(controller))
);

// Authenticated endpoints for trainers/admins
slotInstanceRouter.use(authMiddleware);

slotInstanceRouter.get(
    "/",
    adaptHandler(controller.getInstances.bind(controller))
);

slotInstanceRouter.post(
    "/generate/:templateId",
    adaptHandler(controller.generateForTemplate.bind(controller))
);

slotInstanceRouter.patch(
    "/:id/cancel",
    adaptHandler(controller.cancelInstance.bind(controller))
);

export default slotInstanceRouter;
