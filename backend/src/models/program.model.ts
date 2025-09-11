import { Document, model, Schema, Types } from "mongoose";

export interface IProgram extends Document {
  _id: string;
  programId: string;
  title: string;
  description: string;
  category: string;
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  duration: string; // e.g., "12 weeks"
  trainerId: string | Types.ObjectId; // reference User._id
  status: "active" | "inactive" | "draft";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    programId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    difficultyLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
    },
    price: { type: Number, required: true },
    duration: { type: String },
    trainerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const ProgramModel = model<IProgram>("Program", ProgramSchema);
