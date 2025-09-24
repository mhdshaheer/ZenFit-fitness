import { Router } from "express";
import { container } from "../inversify.config";
import { ISessionController } from "../controllers/interface/session.controller.interface";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { TYPES } from "../shared/types/inversify.types";

const sessionRouter = Router();

const sessionController = container.get<ISessionController>(
  TYPES.SessionController
);

sessionRouter.use(authMiddleware);

sessionRouter.post(
  "/",
  sessionController.saveDraftSession.bind(sessionController)
);
sessionRouter.post(
  "/draft",
  sessionController.saveDraftSession.bind(sessionController)
);

sessionRouter.get("/:id", (req, res, next) => {
  sessionController.getSession(req, res).catch(next);
});

export default sessionRouter;
