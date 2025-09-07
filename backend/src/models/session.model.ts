import { Schema, model, Document, ObjectId } from "mongoose";

export interface ISession extends Document {
  sessionId: string;
  programId: ObjectId;
  trainerId: ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  capacity: number;
  bookedUsers: string[];
  status: "Available" | "Full" | "Completed" | "Cancelled";
  meetingLink: string;
  meetingPassword?: string;
  recordingUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    sessionId: { type: String, required: true, unique: true },
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, required: true },
    capacity: { type: Number, required: true },
    bookedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["Available", "Full", "Completed", "Cancelled"],
      default: "Available",
    },
    meetingLink: { type: String, required: true },
    meetingPassword: { type: String },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export const SessionModel = model<ISession>("Session", SessionSchema);
