import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { ISlotInstanceController } from "../controllers/interface/slotInstance.controller.interface";

const slotInstanceRouter = Router();
const controller = container.get<ISlotInstanceController>(
    TYPES.SlotInstanceController
);

// Public endpoint for users to fetch program-specific instances
slotInstanceRouter.get("/public/program", (req, res, next) => {
    controller.getInstancesForProgram(req, res).catch(next);
});

// Authenticated endpoints for trainers/admins
slotInstanceRouter.use(authMiddleware);

slotInstanceRouter.get("/", (req, res, next) => {
    controller.getInstances(req, res).catch(next);
});

slotInstanceRouter.post("/generate/:templateId", (req, res, next) => {
    controller.generateForTemplate(req, res).catch(next);
});

slotInstanceRouter.patch("/:id/cancel", (req, res, next) => {
    controller.cancelInstance(req, res).catch(next);
});

export default slotInstanceRouter;
