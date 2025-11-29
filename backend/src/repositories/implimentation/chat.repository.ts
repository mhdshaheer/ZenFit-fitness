import { injectable } from "inversify";
import { ChatMessageModel, IChatMessage } from "../../models/chatMessage.model";
import { ChatThreadModel, IChatThread } from "../../models/chatThread.model";
import { BaseRepository } from "../base.repository";
import { IChatRepository } from "../interface/chat.repository.interface";

@injectable()
export class ChatRepository extends BaseRepository<IChatThread> implements IChatRepository {
    constructor() {
        super(ChatThreadModel);
    }
    async getOrCreateThread(userId: string, trainerId: string, programId: string): Promise<IChatThread> {
        const existing = await ChatThreadModel.findOne({ userId, trainerId, programId })
            .populate('userId', 'fullName username profileImage')
            .populate('trainerId', 'fullName username profileImage');
        if (existing) return existing;
        const created = await ChatThreadModel.create({ userId, trainerId, programId, userUnread: 0, trainerUnread: 0 });
        return ChatThreadModel.findById(created._id)
            .populate('userId', 'fullName username profileImage')
            .populate('trainerId', 'fullName username profileImage') as any;
    }

    async findThreadById(threadId: string): Promise<IChatThread | null> {
        return ChatThreadModel.findById(threadId);
    }

    async listThreadsForUser(userId: string): Promise<IChatThread[]> {
        return ChatThreadModel.find({ userId })
            .populate('userId', 'fullName username profileImage')
            .populate('trainerId', 'fullName username profileImage')
            .sort({ updatedAt: -1 });
    }

    async listThreadsForTrainer(trainerId: string): Promise<IChatThread[]> {
        return this.model.find({ trainerId })
            .populate('userId', 'fullName username profileImage')
            .populate('trainerId', 'fullName username profileImage')
            .sort({ updatedAt: -1 });
    }

    async createMessage(threadId: string, senderId: string, senderType: "user" | "trainer", content: string): Promise<IChatMessage> {
        const msg = await ChatMessageModel.create({ threadId, senderId, senderType, content, status: "sent" });
        const inc = senderType === "user" ? { trainerUnread: 1 } : { userUnread: 1 };
        await ChatThreadModel.findByIdAndUpdate(threadId, { lastMessage: content, lastMessageAt: new Date(), $inc: inc });
        return ChatMessageModel.findById(msg._id)
            .populate('senderId', 'fullName username profileImage') as any;
    }

    async listMessages(threadId: string, page: number, limit: number): Promise<IChatMessage[]> {
        return ChatMessageModel.find({ threadId })
            .populate('senderId', 'fullName username profileImage')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: 1 });
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

    async deleteMessage(messageId: string, deleterId: string): Promise<boolean> {
        const message = await ChatMessageModel.findById(messageId);
        if (!message) return false;
        
        // Check if the deleter is the sender
        if (message.senderId.toString() !== deleterId) {
            throw new Error("Unauthorized: You can only delete your own messages");
        }
        
        await ChatMessageModel.findByIdAndDelete(messageId);
        
        // Update thread's last message if this was the last message
        const lastMessage = await ChatMessageModel.findOne({ threadId: message.threadId }).sort({ createdAt: -1 });
        if (lastMessage) {
            await ChatThreadModel.findByIdAndUpdate(message.threadId, {
                lastMessage: lastMessage.content,
                lastMessageAt: lastMessage.createdAt
            });
        } else {
            await ChatThreadModel.findByIdAndUpdate(message.threadId, {
                lastMessage: "",
                lastMessageAt: new Date()
            });
        }
        
        return true;
    }
}
