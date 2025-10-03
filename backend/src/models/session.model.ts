import { Schema, model, Document, ObjectId } from "mongoose";

export interface ISession extends Document {
  programId: ObjectId | string;
  trainerId: ObjectId | string;
  duration: number;
  capacity: number;
  bookedUsers: string[];
  status: "Available" | "Full" | "Completed" | "Cancelled";
  meetingLink: string;
  meetingPassword?: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  timeSlots: {
    date: Date;
    startTime: string;
    endTime: string;
  }[];
  slotStatus: "active" | "inactive" | "draft";
}

const SessionSchema = new Schema<ISession>(
  {
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timeSlots: [
      {
        date: { type: Date },
        startTime: { type: String }, // e.g. "10:00"
        endTime: { type: String }, // e.g. "11:00"
      },
    ],
    duration: { type: Number, required: true },
    capacity: { type: Number, required: true },
    bookedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["Available", "Full", "Completed", "Cancelled"],
      default: "Available",
    },
    meetingLink: { type: String },
    meetingPassword: { type: String },
    recordingUrl: { type: String },
    slotStatus: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const SessionModel = model<ISession>("Session", SessionSchema);
