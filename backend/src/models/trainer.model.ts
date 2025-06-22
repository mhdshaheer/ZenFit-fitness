import mongoose, { Model } from "mongoose";
import { ITrainer } from "../interfaces/trainer.interface";
const trainerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
    },
    phone: {
      type: Number,
    },
    dob: {
      type: Date,
    },
    experience: {
      type: Number,
    },
    languages: {
      type: Array,
    },
    address: {
      type: String,
    },
    role: {
      type: String,
    },
  },
  { timestamps: true }
);

export const TrainerModel: Model<ITrainer> = mongoose.model<ITrainer>(
  "Trainer",
  trainerSchema
);
