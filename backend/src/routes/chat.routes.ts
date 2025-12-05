import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { TYPES } from "../shared/types/inversify.types";
import { container } from "../inversify.config";
import { IChatController } from "../controllers/interface/chat.controller.interface";
import { adaptHandler } from "../shared/utils/routeHandler.util";

const chatRouter = Router();
const controller = container.get<IChatController>(TYPES.ChatController);

chatRouter.use(authMiddleware);

chatRouter.post(
  "/init/:programId",
  adaptHandler(controller.initThread.bind(controller))
);

chatRouter.get(
  "/threads",
  adaptHandler(controller.getThreads.bind(controller))
);

chatRouter.get(
  "/trainer/threads",
  adaptHandler(controller.getTrainerThreads.bind(controller))
);

chatRouter.get(
  "/:threadId/messages",
  adaptHandler(controller.getMessages.bind(controller))
);

chatRouter.post(
  "/:threadId/read",
  adaptHandler(controller.markRead.bind(controller))
);

chatRouter.post(
  "/:threadId/message",
  adaptHandler(controller.sendMessage.bind(controller))
);

chatRouter.delete(
  "/message/:messageId",
  adaptHandler(controller.deleteMessage.bind(controller))
);

export default chatRouter;