import { inject, injectable } from "inversify";
import { Response } from "express";
import { HttpStatus } from "../../const/statuscode.const";
import { IChatService } from "../../services/interface/chat.service.interface";
import { IChatController } from "../interface/chat.controller.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { getIO } from "../../shared/sockets/socket";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

@injectable()
export class ChatController implements IChatController {
  constructor(
    @inject(TYPES.ChatService) private readonly chat: IChatService
  ) { }

  async initThread(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { programId } = req.params as { programId?: string };
    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    if (!programId) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "Program id is required" });
      return;
    }

    const thread = await this.chat.initThreadForUser(userId, programId);
    res.status(HttpStatus.OK).json({ success: true, data: thread });
  }

  async getThreads(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "User not authenticated" });
      return;
    }
    const threads = await this.chat.listMyThreads(userId);
    res.status(HttpStatus.OK).json({ success: true, data: threads });
  }

  async getTrainerThreads(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const trainerId = req.user?.id;

    if (!trainerId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "Trainer not authenticated" });
      return;
    }

    try {
      const threads = await this.chat.listTrainerThreads(trainerId);
      res.status(HttpStatus.OK).json({ success: true, data: threads });
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching trainer threads:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch trainer threads",
      });
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { threadId } = req.params as { threadId?: string };
    if (!threadId) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "threadId is required" });
      return;
    }

    const { page = "1", limit = "50" } = req.query as {
      page?: string;
      limit?: string;
    };

    const pageNumber = Number.parseInt(page, 10);
    const limitNumber = Number.parseInt(limit, 10);

    const messages = await this.chat.getMessages(
      threadId,
      Number.isNaN(pageNumber) ? 1 : pageNumber,
      Number.isNaN(limitNumber) ? 50 : limitNumber
    );
    res.status(HttpStatus.OK).json({ success: true, data: messages });
  }

  async markRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { threadId } = req.params as { threadId?: string };
    const readerId = req.user?.id;
    const role = req.user?.role as "user" | "trainer" | undefined;

    if (!readerId || !role) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    if (!threadId) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "threadId is required" });
      return;
    }

    await this.chat.markThreadRead(threadId, role);

    try {
      const io = getIO();
      io.to(`thread-${threadId}`).emit("chat:read", {
        threadId,
        readerId,
        readerType: role,
      });
    } catch (error) {
      console.error("Error emitting read event:", error);
    }

    res.status(HttpStatus.OK).json({ success: true });
  }

  async sendMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { threadId } = req.params as { threadId?: string };
    const senderId = req.user?.id;
    const senderRole = req.user?.role as "user" | "trainer" | undefined;
    const { content } = (req.body ?? {}) as { content?: string };

    if (!threadId) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "threadId is required" });
      return;
    }

    if (!senderId || !senderRole) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    if (!content) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "Message content is required" });
      return;
    }

    const message = await this.chat.sendMessage(
      threadId,
      senderId,
      senderRole,
      content
    );

    try {
      const io = getIO();
      io.to(`thread-${threadId}`).emit("chat:newMessage", message);

      const participants = await this.chat.getThreadParticipants(threadId);
      if (participants.userId) {
        io.to(`user-${participants.userId}`).emit("chat:delivered", {
          threadId,
        });
      }
      if (participants.trainerId) {
        io.to(`trainer-${participants.trainerId}`).emit("chat:delivered", {
          threadId,
        });
      }
    } catch (error) {
      console.error("Error emitting socket event:", error);
    }

    res.status(HttpStatus.OK).json({ success: true, data: message });
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { messageId } = req.params as { messageId?: string };
    const deleterId = req.user?.id;

    if (!messageId) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "messageId is required" });
      return;
    }

    if (!deleterId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: "User not authenticated" });
      return;
    }

    try {
      const deleted = await this.chat.deleteMessage(messageId, deleterId);

      if (deleted) {
        try {
          const io = getIO();
          io.emit("chat:messageDeleted", { messageId });
        } catch (error) {
          console.error("Error emitting delete event:", error);
        }

        res
          .status(HttpStatus.OK)
          .json({ success: true, message: "Message deleted successfully" });
      } else {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "Message not found" });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ success: false, message: "Failed to delete message" });
    }
  }
}
