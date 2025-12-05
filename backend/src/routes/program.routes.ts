import { Router } from "express";
import { container } from "../inversify.config";
import { IProgramController } from "../controllers/interface/program.controller.interface";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { TYPES } from "../shared/types/inversify.types";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const programRouter = Router();
const programController = container.get<IProgramController>(
  TYPES.ProgramController
);

programRouter.use(authMiddleware);

programRouter.post(
  "/",
  adaptHandler(programController.saveProgram.bind(programController))
);
programRouter.get(
  "/",
  adaptHandler(programController.getAllPrograms.bind(programController))
);
programRouter.post(
  "/draft",
  adaptHandler(programController.saveProgramDraft.bind(programController))
);
programRouter.get(
  "/trainer",
  adaptHandler(programController.getPrograms.bind(programController))
);
programRouter.get(
  "/category",
  adaptHandler(programController.getProgramsCategories.bind(programController))
);
programRouter.get(
  "/create-slots",
  adaptHandler(programController.getProgramsForSlotCreate.bind(programController))
);
programRouter.get(
  "/:id",
  adaptHandler(programController.findProgram.bind(programController))
);

programRouter.put(
  "/:id",
  adaptHandler(programController.updateProgram.bind(programController))
);
programRouter.get(
  "/category/:id",
  adaptHandler(programController.getProgramsByParantId.bind(programController))
);
programRouter.put(
  "/approvalStatus/:programId",
  adaptHandler(programController.updateApprovalStatus.bind(programController))
);

export default programRouter;
