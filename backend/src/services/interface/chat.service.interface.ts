import { IChatThread } from "../../models/chatThread.model";
import { IChatMessage } from "../../models/chatMessage.model";

export interface IChatService {
    initThreadForUser(userId: string, programId: string): Promise<IChatThread>;
    listMyThreads(userId: string): Promise<IChatThread[]>;
    listTrainerThreads(trainerId: string): Promise<IChatThread[]>;
    getMessages(threadId: string, page: number, limit: number): Promise<IChatMessage[]>;
    sendMessage(threadId: string, senderId: string, senderType: "user" | "trainer", content: string): Promise<IChatMessage>;
    markThreadRead(threadId: string, readerType: "user" | "trainer"): Promise<void>;
    canAccessThread(threadId: string, actorId: string, role: "user" | "trainer"): Promise<boolean>;
    getThreadParticipants(threadId: string): Promise<{ userId: string; trainerId: string; programId: string }>;
    deleteMessage(messageId: string, deleterId: string): Promise<boolean>;
}