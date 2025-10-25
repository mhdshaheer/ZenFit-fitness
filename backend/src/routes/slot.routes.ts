import { Router } from "express";
import { container } from "../inversify.config";
import { ISlotController } from "../controllers/interface/slot.controller.interface";
import { TYPES } from "../shared/types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";

const slotRouter = Router();
const controller = container.get<ISlotController>(TYPES.SlotController);

slotRouter.use(authMiddleware);

slotRouter.post("/", (req, res, next) => {
  controller.createSlot(req, res).catch(next);
});
slotRouter.get("/", (req, res, next) => {
  controller.getSlotsByTrainerId(req, res).catch(next);
});
slotRouter.put("/status/:slotId", (req, res, next) => {
  controller.updateSlotStatus(req, res).catch(next);
});
slotRouter.put("/:slotId", (req, res, next) => {
  controller.updateSlot(req, res).catch(next);
});

export default slotRouter;
