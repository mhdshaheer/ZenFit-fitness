import { inject, injectable } from "inversify";
import { IChatRepository } from "../../repositories/interface/chat.repository.interface";
import { IChatService } from "../interface/chat.service.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { PaymentModel } from "../../models/payment.model";
import mongoose from "mongoose";



@injectable()
export class ChatService implements IChatService {
  @inject(TYPES.ChatRepository) private readonly repo!: IChatRepository
  
  constructor() {
    console.log('ChatService constructor called');
    console.log('repo injected:', this.repo);
    console.log('repo type:', typeof this.repo);
  }

  async initThreadForUser(userId: string, programId: string) {
    console.log('initThreadForUser called, repo:', this.repo);
    const payment = await PaymentModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      programId: new mongoose.Types.ObjectId(programId),
      paymentStatus: "success",
    });
    if (!payment) throw new Error("Not purchased");
    const trainerId = payment.trainerId.toString();
    return this.repo.getOrCreateThread(userId, trainerId, programId);
  }

  async listMyThreads(userId: string) {
    console.log('listMyThreads called, repo:', this.repo);
    return this.repo.listThreadsForUser(userId);
  }

  async listTrainerThreads(trainerId: string) {
    console.log('reached on List Trainer Thread service');
    console.log('repo instance:', this.repo);
    console.log('repo has method listThreadsForTrainer:', typeof this.repo.listThreadsForTrainer);
    const listTrainerThread = await this.repo.listThreadsForTrainer(trainerId);
    console.log("list trainer thread", listTrainerThread);
    return listTrainerThread;
  }

  async getMessages(threadId: string, page: number, limit: number) {
    console.log('getMessages called, repo:', this.repo);
    return this.repo.listMessages(threadId, page, limit);
  }

  async sendMessage(threadId: string, senderId: string, senderType: "user" | "trainer", content: string) {
    console.log('sendMessage called, repo:', this.repo);
    const ok = await this.canAccessThread(threadId, senderId, senderType);
    if (!ok) throw new Error("Forbidden");
    if (!content || content.length > 2000) throw new Error("Invalid content");
    return this.repo.createMessage(threadId, senderId, senderType, content);
  }

  async markThreadRead(threadId: string, readerType: "user" | "trainer") {
    console.log('markThreadRead called, repo:', this.repo);
    await this.repo.markThreadRead(threadId, readerType);
  }

  async canAccessThread(threadId: string, actorId: string, role: "user" | "trainer") {
    console.log('canAccessThread called, repo:', this.repo);
    const t = await this.repo.findThreadById(threadId);
    if (!t) return false;
    return role === "user" ? t.userId.toString() === actorId : t.trainerId.toString() === actorId;
  }

  async getThreadParticipants(threadId: string) {
    console.log('getThreadParticipants called, repo:', this.repo);
    return this.repo.getParticipants(threadId);
  }
}
