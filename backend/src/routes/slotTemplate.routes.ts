import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { container } from "../inversify.config";
import { TYPES } from "../shared/types/inversify.types";
import { ISlotTemplateController } from "../controllers/interface/slotTemplate.controller.interface";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const slotTemplateRouter = Router();
const controller = container.get<ISlotTemplateController>(
    TYPES.SlotTemplateController
);

slotTemplateRouter.use(authMiddleware);

slotTemplateRouter.post(
    "/",
    adaptHandler(controller.createTemplate.bind(controller))
);

slotTemplateRouter.patch(
    "/:id",
    adaptHandler(controller.updateTemplate.bind(controller))
);

slotTemplateRouter.get(
    "/",
    adaptHandler(controller.getTemplates.bind(controller))
);

slotTemplateRouter.delete(
    "/:id",
    adaptHandler(controller.deleteTemplate.bind(controller))
);

export default slotTemplateRouter;
