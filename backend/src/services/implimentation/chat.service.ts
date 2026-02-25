import { inject, injectable } from "inversify";
import { IChatRepository } from "../../repositories/interface/chat.repository.interface";
import { IChatService } from "../interface/chat.service.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { PaymentModel } from "../../models/payment.model";
import mongoose from "mongoose";
import { S3Service } from "../../shared/services/s3.service";
import { IChatThread } from "../../models/chatThread.model";
import { IChatMessage } from "../../models/chatMessage.model";



@injectable()
export class ChatService implements IChatService {
  @inject(TYPES.ChatRepository) private readonly repo!: IChatRepository;
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  private async generatePresignedUrls<T>(data: T): Promise<T> {
    if (data === null || data === undefined) { return data; }

    // Handle array of objects
    if (Array.isArray(data)) {
      return Promise.all(data.map(item => this.generatePresignedUrls(item))) as unknown as T;
    }

    // Convert Mongoose document to plain object
    let result: Record<string, unknown>;
    const dataObj = data as { _doc?: unknown; toObject?: () => unknown };

    if (dataObj._doc !== undefined) {
      result = JSON.parse(JSON.stringify(dataObj)) as Record<string, unknown>;
    } else if (typeof dataObj.toObject === 'function') {
      result = dataObj.toObject() as Record<string, unknown>;
    } else {
      result = { ...(data as Record<string, unknown>) };
    }

    // Generate presigned URL for userId if it's an object with profileImage
    if (result.userId !== undefined && result.userId !== null && typeof result.userId === 'object' && 'profileImage' in (result.userId as object)) {
      const userId = result.userId as Record<string, unknown>;
      const userObj = ((userId._doc as Record<string, unknown> | undefined) ?? userId);
      result.userId = {
        _id: userObj._id,
        fullName: userObj.fullName,
        username: userObj.username,
        profileImage: await this.s3Service.getFileUrl(userObj.profileImage as string, 3600)
      };
    }

    // Generate presigned URL for trainerId if it's an object with profileImage
    if (result.trainerId !== undefined && result.trainerId !== null && typeof result.trainerId === 'object' && 'profileImage' in (result.trainerId as object)) {
      const trainerId = result.trainerId as Record<string, unknown>;
      const trainerObj = ((trainerId._doc as Record<string, unknown> | undefined) ?? trainerId);
      result.trainerId = {
        _id: trainerObj._id,
        fullName: trainerObj.fullName,
        username: trainerObj.username,
        profileImage: await this.s3Service.getFileUrl(trainerObj.profileImage as string, 3600)
      };
    }

    // Generate presigned URL for senderId if it's an object with profileImage
    if (result.senderId !== undefined && result.senderId !== null && typeof result.senderId === 'object' && 'profileImage' in (result.senderId as object)) {
      const senderId = result.senderId as Record<string, unknown>;
      const senderObj = ((senderId._doc as Record<string, unknown> | undefined) ?? senderId);
      result.senderId = {
        _id: senderObj._id,
        fullName: senderObj.fullName,
        username: senderObj.username,
        profileImage: await this.s3Service.getFileUrl(senderObj.profileImage as string, 3600)
      };
    }

    return result as unknown as T;
  }

  async initThreadForUser(userId: string, programId: string): Promise<IChatThread> {
    const payment = await PaymentModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      programId: new mongoose.Types.ObjectId(programId),
      paymentStatus: "success",
    });
    if (!payment) { throw new Error("Not purchased"); }
    const trainerId = payment.trainerId.toString();
    const thread = await this.repo.getOrCreateThread(userId, trainerId, programId);
    return this.generatePresignedUrls(thread);
  }

  async listMyThreads(userId: string): Promise<IChatThread[]> {
    const threads = await this.repo.listThreadsForUser(userId);
    return this.generatePresignedUrls(threads);
  }

  async listTrainerThreads(trainerId: string): Promise<IChatThread[]> {
    const listTrainerThread = await this.repo.listThreadsForTrainer(trainerId);
    return this.generatePresignedUrls(listTrainerThread);
  }

  async getMessages(threadId: string, page: number, limit: number): Promise<IChatMessage[]> {
    const messages = await this.repo.listMessages(threadId, page, limit);
    return this.generatePresignedUrls(messages);
  }

  async sendMessage(threadId: string, senderId: string, senderType: "user" | "trainer", content: string): Promise<IChatMessage> {
    const ok = await this.canAccessThread(threadId, senderId, senderType);
    if (!ok) { throw new Error("Forbidden"); }
    if (!content || content.length > 2000) { throw new Error("Invalid content"); }
    const message = await this.repo.createMessage(threadId, senderId, senderType, content);
    return this.generatePresignedUrls(message);
  }

  async markThreadRead(threadId: string, readerType: "user" | "trainer"): Promise<void> {
    await this.repo.markThreadRead(threadId, readerType);
  }

  async canAccessThread(threadId: string, actorId: string, role: "user" | "trainer"): Promise<boolean> {
    const t = await this.repo.findThreadById(threadId);
    if (t === null) { return false; }
    return role === "user" ? t.userId.toString() === actorId : t.trainerId.toString() === actorId;
  }

  async getThreadParticipants(threadId: string): Promise<{ userId: string; trainerId: string; programId: string }> {
    return this.repo.getParticipants(threadId);
  }

  async deleteMessage(messageId: string, deleterId: string): Promise<boolean> {
    const result = await this.repo.deleteMessage(messageId, deleterId);
    return result !== null;
  }
}
