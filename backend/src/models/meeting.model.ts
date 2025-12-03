import { Schema, model, Document } from "mongoose";

export interface IMeeting extends Document {
  meetingId: string;
  slotId: Schema.Types.ObjectId;
  hostId: Schema.Types.ObjectId;
  participants: Array<{
    userId: Schema.Types.ObjectId;
    joinedAt: Date;
    leftAt?: Date;
  }>;
  status: 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema = new Schema<IMeeting>(
  {
    meetingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "SlotInstance",
      required: true,
      index: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    participants: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        leftAt: {
          type: Date,
        },
      },
    ],
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
MeetingSchema.index({ slotId: 1, status: 1 });
MeetingSchema.index({ hostId: 1, status: 1 });

export const MeetingModel = model<IMeeting>("Meeting", MeetingSchema);
