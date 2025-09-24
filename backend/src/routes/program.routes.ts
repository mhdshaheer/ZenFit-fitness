import { Router } from "express";
import { container } from "../inversify.config";
import { IProgramController } from "../controllers/interface/program.controller.interface";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { TYPES } from "../shared/types/inversify.types";

const programRouter = Router();
const programController = container.get<IProgramController>(
  TYPES.ProgramController
);

programRouter.use(authMiddleware);

programRouter.post("/", programController.saveProgram.bind(programController));
programRouter.post(
  "/draft",
  programController.saveProgramDraft.bind(programController)
);
programRouter.get("/", programController.getPrograms.bind(programController));
programRouter.get(
  "/category",

  programController.getProgramsCategories.bind(programController)
);
programRouter.get(
  "/category/:id",
  programController.getProgramsByParantId.bind(programController)
);
programRouter.get("/:id", (req, res, next) => {
  programController.findProgram(req, res).catch(next);
});

programRouter.put("/:id", (req, res, next) => {
  programController.updateProgram(req, res).catch(next);
});

export default programRouter;
