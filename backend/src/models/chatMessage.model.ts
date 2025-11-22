import mongoose, { Model, Schema, Types } from "mongoose";

export interface IChatMessage {
    threadId: Types.ObjectId;
    senderId: Types.ObjectId;
    senderType: "user" | "trainer";
    content: string;
    status: "sent" | "delivered" | "read";
    createdAt?: Date;
    updatedAt?: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
    {
        threadId: { type: Schema.Types.ObjectId, ref: "ChatThread", required: true, index: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        senderType: { type: String, enum: ["user", "trainer"], required: true },
        content: { type: String, required: true },
        status: { type: String, enum: ["sent", "delivered", "read"], default: "sent" },
    },
    { timestamps: true }
);

export const ChatMessageModel: Model<IChatMessage> = mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);