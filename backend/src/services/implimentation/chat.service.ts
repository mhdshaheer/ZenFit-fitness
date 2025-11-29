import { inject, injectable } from "inversify";
import { IChatRepository } from "../../repositories/interface/chat.repository.interface";
import { IChatService } from "../interface/chat.service.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { PaymentModel } from "../../models/payment.model";
import mongoose from "mongoose";
import { S3Service } from "../../shared/services/s3.service";



@injectable()
export class ChatService implements IChatService {
  @inject(TYPES.ChatRepository) private readonly repo!: IChatRepository
  private s3Service: S3Service;
  
  constructor() {
    this.s3Service = new S3Service();
  }

  private async generatePresignedUrls(data: any): Promise<any> {
    if (!data) return data;
    
    // Handle array of objects
    if (Array.isArray(data)) {
      return Promise.all(data.map(item => this.generatePresignedUrls(item)));
    }
    
    // Convert Mongoose document to plain object
    let result: any;
    if (data._doc) {
      result = JSON.parse(JSON.stringify(data));
    } else if (data.toObject && typeof data.toObject === 'function') {
      result = data.toObject();
    } else {
      result = { ...data };
    }
    
    // Generate presigned URL for userId if it's an object with profileImage
    if (result.userId && typeof result.userId === 'object' && result.userId.profileImage) {
      const userObj = result.userId._doc || result.userId;
      result.userId = {
        _id: userObj._id,
        fullName: userObj.fullName,
        username: userObj.username,
        profileImage: await this.s3Service.getFileUrl(userObj.profileImage, 3600)
      };
    }
    
    // Generate presigned URL for trainerId if it's an object with profileImage
    if (result.trainerId && typeof result.trainerId === 'object' && result.trainerId.profileImage) {
      const trainerObj = result.trainerId._doc || result.trainerId;
      result.trainerId = {
        _id: trainerObj._id,
        fullName: trainerObj.fullName,
        username: trainerObj.username,
        profileImage: await this.s3Service.getFileUrl(trainerObj.profileImage, 3600)
      };
    }
    
    // Generate presigned URL for senderId if it's an object with profileImage
    if (result.senderId && typeof result.senderId === 'object' && result.senderId.profileImage) {
      const senderObj = result.senderId._doc || result.senderId;
      result.senderId = {
        _id: senderObj._id,
        fullName: senderObj.fullName,
        username: senderObj.username,
        profileImage: await this.s3Service.getFileUrl(senderObj.profileImage, 3600)
      };
    }
    
    return result;
  }

  async initThreadForUser(userId: string, programId: string) {
    const payment = await PaymentModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      programId: new mongoose.Types.ObjectId(programId),
      paymentStatus: "success",
    });
    if (!payment) throw new Error("Not purchased");
    const trainerId = payment.trainerId.toString();
    const thread = await this.repo.getOrCreateThread(userId, trainerId, programId);
    return this.generatePresignedUrls(thread);
  }

  async listMyThreads(userId: string) {
    const threads = await this.repo.listThreadsForUser(userId);
    return this.generatePresignedUrls(threads);
  }

  async listTrainerThreads(trainerId: string) {
    const listTrainerThread = await this.repo.listThreadsForTrainer(trainerId);
    return this.generatePresignedUrls(listTrainerThread);
  }

  async getMessages(threadId: string, page: number, limit: number) {
    const messages = await this.repo.listMessages(threadId, page, limit);
    return this.generatePresignedUrls(messages);
  }

  async sendMessage(threadId: string, senderId: string, senderType: "user" | "trainer", content: string) {
    const ok = await this.canAccessThread(threadId, senderId, senderType);
    if (!ok) throw new Error("Forbidden");
    if (!content || content.length > 2000) throw new Error("Invalid content");
    const message = await this.repo.createMessage(threadId, senderId, senderType, content);
    return this.generatePresignedUrls(message);
  }

  async markThreadRead(threadId: string, readerType: "user" | "trainer") {
    await this.repo.markThreadRead(threadId, readerType);
  }

  async canAccessThread(threadId: string, actorId: string, role: "user" | "trainer") {
    const t = await this.repo.findThreadById(threadId);
    if (!t) return false;
    return role === "user" ? t.userId.toString() === actorId : t.trainerId.toString() === actorId;
  }

  async getThreadParticipants(threadId: string) {
    return this.repo.getParticipants(threadId);
  }

  async deleteMessage(messageId: string, deleterId: string) {
    return this.repo.deleteMessage(messageId, deleterId);
  }
}
