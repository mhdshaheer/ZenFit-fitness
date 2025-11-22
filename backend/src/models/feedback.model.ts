import mongoose, { Schema, Document } from "mongoose";

export interface IFeedback extends Document {
  slotId: string;
  trainerId: string;
  sessionDate: Date;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    slotId: {
      type: String,
      required: true,
    },
    trainerId: {
      type: String,
      required: true,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure one feedback per slot per session date
feedbackSchema.index({ slotId: 1, sessionDate: 1 }, { unique: true });

export const Feedback = mongoose.model<IFeedback>("Feedback", feedbackSchema);
