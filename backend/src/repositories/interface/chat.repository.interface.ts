import { IChatMessage } from "../../models/chatMessage.model";
import { IChatThread } from "../../models/chatThread.model";


export interface IChatRepository {
    getOrCreateThread(userId: string, trainerId: string, programId: string): Promise<IChatThread>;
    findThreadById(threadId: string): Promise<IChatThread | null>;
    listThreadsForUser(userId: string): Promise<IChatThread[]>;
    listThreadsForTrainer(trainerId: string): Promise<IChatThread[]>;
    createMessage(threadId: string, senderId: string, senderType: "user" | "trainer", content: string): Promise<IChatMessage>;
    listMessages(threadId: string, page: number, limit: number): Promise<IChatMessage[]>;
    markThreadRead(threadId: string, readerType: "user" | "trainer"): Promise<void>;
    getParticipants(threadId: string): Promise<{ userId: string; trainerId: string; programId: string }>;
}