import mongoose, { Model, Schema, Types } from "mongoose";

export interface IChatThread {
    userId: Types.ObjectId;
    trainerId: Types.ObjectId;
    programId: Types.ObjectId;
    lastMessage?: string;
    lastMessageAt?: Date;
    userUnread: number;
    trainerUnread: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const chatThreadSchema = new Schema<IChatThread>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        programId: { type: Schema.Types.ObjectId, ref: "Program", required: true, index: true },
        lastMessage: { type: String },
        lastMessageAt: { type: Date },
        userUnread: { type: Number, default: 0 },
        trainerUnread: { type: Number, default: 0 },
    },
    { timestamps: true }
);

chatThreadSchema.index({ userId: 1, trainerId: 1, programId: 1 }, { unique: true });

export const ChatThreadModel: Model<IChatThread> = mongoose.model<IChatThread>("ChatThread", chatThreadSchema);