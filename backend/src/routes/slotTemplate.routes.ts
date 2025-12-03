import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { ISlotTemplateController } from "../controllers/interface/slotTemplate.controller.interface";

const slotTemplateRouter = Router();
const controller = container.get<ISlotTemplateController>(
    TYPES.SlotTemplateController
);

slotTemplateRouter.use(authMiddleware);

slotTemplateRouter.post("/", (req, res, next) => {
    controller.createTemplate(req, res).catch(next);
});

slotTemplateRouter.patch("/:id", (req, res, next) => {
    controller.updateTemplate(req, res).catch(next);
});

slotTemplateRouter.get("/", (req, res, next) => {
    controller.getTemplates(req, res).catch(next);
});

slotTemplateRouter.delete("/:id", (req, res, next) => {
    controller.deleteTemplate(req, res).catch(next);
});

export default slotTemplateRouter;
