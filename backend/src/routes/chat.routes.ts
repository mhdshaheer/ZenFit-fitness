import { Router } from "express";
import authMiddleware from "../middlewares/verifyToken.middleware";
import { TYPES } from "../shared/types/inversify.types";
import { container } from "../inversify.config";
import { IChatController } from "../controllers/interface/chat.controller.interface";


const chatRouter = Router();
const controller = container.get<IChatController>(TYPES.ChatController);

chatRouter.use(authMiddleware);

chatRouter.post("/init/:programId", (req, res, next) => {
  controller.initThread(req, res).catch(next);
});

chatRouter.get("/threads", (req, res, next) => {
  controller.getThreads(req, res).catch(next);
});

chatRouter.get("/trainer/threads", (req, res, next) => {
  controller.getTrainerThreads(req, res).catch(next);
});

chatRouter.get("/:threadId/messages", (req, res, next) => {
  controller.getMessages(req, res).catch(next);
});

chatRouter.post("/:threadId/read", (req, res, next) => {
  controller.markRead(req, res).catch(next);
});

chatRouter.post("/:threadId/message", (req, res, next) => {
  controller.sendMessage(req, res).catch(next);
});

export default chatRouter;