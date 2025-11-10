import { inject, injectable } from "inversify";
import { Request, Response } from "express";
import { HttpStatus } from "../../const/statuscode.const";
import { IChatService } from "../../services/interface/chat.service.interface";
import { IChatController } from "../interface/chat.controller.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { getIO } from "../../shared/sockets/socket";

@injectable()
export class ChatController implements IChatController {
  constructor(
    @inject(TYPES.ChatService) private readonly chat: IChatService
  ) {}

  async initThread(req: Request, res: Response): Promise<void> {
    const userId = (req as any).user.id;
    const programId = req.params.programId;
    const thread = await this.chat.initThreadForUser(userId, programId);
    res.status(HttpStatus.OK).json({ success: true, data: thread });
  }

  async getThreads(req: Request, res: Response): Promise<void> {
    console.log((req as any).user);
    const userId = (req as any).user.id;
    const threads = await this.chat.listMyThreads(userId);
    res.status(HttpStatus.OK).json({ success: true, data: threads });
  }

  async getTrainerThreads(req: Request, res: Response): Promise<void> {
    // console.log((req as any).user);
    // const trainerId = (req as any).user.id;
    // const threads = await this.chat.listTrainerThreads(trainerId);
    // res.status(HttpStatus.OK).json({ success: true, data: threads });

    try {
        console.log("Reached on trainer threads controller")
        const trainerId = (req as any).user.id;
        console.log("Trainer id is ", trainerId)
    const threads = await this.chat.listTrainerThreads(trainerId);
    res.status(200).json({ success: true, data: threads });
  } catch (error:any) {
    console.error("Error fetching trainer threads:", error);
    res.status(500).json({ success: false, message: error.message });
  }
  }

  async getMessages(req: Request, res: Response): Promise<void> {
    const threadId = req.params.threadId;
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "50", 10);
    const messages = await this.chat.getMessages(threadId, page, limit);
    res.status(HttpStatus.OK).json({ success: true, data: messages });
  }

  async markRead(req: Request, res: Response): Promise<void> {
    const threadId = req.params.threadId;
    const readerId = (req as any).user.id;
    const role = (req as any).user.role as "user" | "trainer";
    await this.chat.markThreadRead(threadId, role);
    
    // Emit real-time read event
    try {
      const io = getIO();
      io.to(`thread-${threadId}`).emit("chat:read", { threadId, readerId, readerType: role });
    } catch (error) {
      console.error("Error emitting read event:", error);
    }
    
    res.status(HttpStatus.OK).json({ success: true });
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    const threadId = req.params.threadId;
    const senderId = (req as any).user.id;
    const senderType = (req as any).user.role as "user" | "trainer";
    const { content } = req.body as { content: string };
    const message = await this.chat.sendMessage(threadId, senderId, senderType, content);
    
    // Emit real-time event to all clients in the thread
    try {
      const io = getIO();
      io.to(`thread-${threadId}`).emit("chat:newMessage", message);
      
      // Notify participants about new message
      const participants = await this.chat.getThreadParticipants(threadId);
      if (participants.userId) {
        io.to(`user-${participants.userId}`).emit("chat:delivered", { threadId });
      }
      if (participants.trainerId) {
        io.to(`trainer-${participants.trainerId}`).emit("chat:delivered", { threadId });
      }
    } catch (error) {
      console.error("Error emitting socket event:", error);
    }
    
    res.status(HttpStatus.OK).json({ success: true, data: message });
  }
}
