import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  receiverId: string;
  receiverType: "user" | "trainer" | "admin";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    receiverId: { type: String, required: true },
    receiverType: {
      type: String,
      enum: ["user", "trainer", "admin"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NotificationModel = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
