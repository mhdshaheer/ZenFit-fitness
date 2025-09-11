import { Router } from "express";
import { container } from "../inversify.config";
import { ISessionController } from "../controllers/interface/session.controller.interface";
import { TYPES } from "../types/inversify.types";
import authMiddleware from "../middlewares/verifyToken.middleware";

const sessionRouter = Router();

const sessionController = container.get<ISessionController>(
  TYPES.SessionController
);

sessionRouter.post(
  "/",
  authMiddleware,
  sessionController.saveDraftSession.bind(sessionController)
);
sessionRouter.post(
  "/draft",
  authMiddleware,
  sessionController.saveDraftSession.bind(sessionController)
);

export default sessionRouter;
