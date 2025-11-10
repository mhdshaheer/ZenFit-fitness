import { injectable } from "inversify";
import { ChatMessageModel, IChatMessage } from "../../models/chatMessage.model";
import { ChatThreadModel, IChatThread } from "../../models/chatThread.model";
import { BaseRepository } from "../base.repository";
import { IChatRepository } from "../interface/chat.repository.interface";

@injectable()
export class ChatRepository extends BaseRepository<IChatThread> implements IChatRepository {
    constructor() {
        super(ChatThreadModel);
        console.log('ChatRepository constructor called');
        console.log('ChatRepository initialized with model:', this.model);
        console.log(" ChatRepository loaded:", ChatThreadModel?.modelName);
    }
    async getOrCreateThread(userId: string, trainerId: string, programId: string): Promise<IChatThread> {
        const existing = await ChatThreadModel.findOne({ userId, trainerId, programId });
        if (existing) return existing;
        const created = await ChatThreadModel.create({ userId, trainerId, programId, userUnread: 0, trainerUnread: 0 });
        return created;
    }

    async findThreadById(threadId: string): Promise<IChatThread | null> {
        return ChatThreadModel.findById(threadId);
    }

    async listThreadsForUser(userId: string): Promise<IChatThread[]> {
        return ChatThreadModel.find({ userId }).sort({ updatedAt: -1 });
    }

    async listThreadsForTrainer(trainerId: string): Promise<IChatThread[]> {
        console.log("Chat thread...")
        console.log("chat tread model :", ChatThreadModel)
        return this.model.find({ trainerId }).sort({ updatedAt: -1 });
    }

    async createMessage(threadId: string, senderId: string, senderType: "user" | "trainer", content: string): Promise<IChatMessage> {
        const msg = await ChatMessageModel.create({ threadId, senderId, senderType, content, status: "sent" });
        const inc = senderType === "user" ? { trainerUnread: 1 } : { userUnread: 1 };
        await ChatThreadModel.findByIdAndUpdate(threadId, { lastMessage: content, lastMessageAt: new Date(), $inc: inc });
        return msg;
    }

    async listMessages(threadId: string, page: number, limit: number): Promise<IChatMessage[]> {
        return ChatMessageModel.find({ threadId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).sort({ createdAt: 1 });
    }

    async markThreadRead(threadId: string, readerType: "user" | "trainer"): Promise<void> {
        const field = readerType === "user" ? { userUnread: 0 } : { trainerUnread: 0 };
        await ChatThreadModel.findByIdAndUpdate(threadId, field);
        await ChatMessageModel.updateMany({ threadId }, { status: "read" });
    }

    async getParticipants(threadId: string): Promise<{ userId: string; trainerId: string; programId: string }> {
        const t = await ChatThreadModel.findById(threadId);
        if (!t) throw new Error("Thread not found");
        return { userId: t.userId.toString(), trainerId: t.trainerId.toString(), programId: t.programId.toString() };
    }
}
