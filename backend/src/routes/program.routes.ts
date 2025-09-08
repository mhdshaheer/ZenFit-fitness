import { Router } from "express";
import { TYPES } from "../types/inversify.types";
import { container } from "../inversify.config";
import { IProgramController } from "../controllers/interface/program.controller.interface";
import authMiddleware from "../middlewares/verifyToken.middleware";

const programRouter = Router();
const programController = container.get<IProgramController>(
  TYPES.ProgramController
);

programRouter.post(
  "/draft",
  authMiddleware,
  programController.saveProgramDraft.bind(programController)
);

export default programRouter;
