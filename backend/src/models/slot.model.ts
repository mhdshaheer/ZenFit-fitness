import { Schema, Document, Types, model } from "mongoose";
import { ISlotStatus } from "../interfaces/slot.interface";

export interface ISlot extends Document {
  trainerId: Types.ObjectId;
  programId: Types.ObjectId;
  days: string[];
  startTime: string;
  endTime: string;
  status: ISlotStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SlotSchema = new Schema<ISlot>(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
    programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    days: { type: [String], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export const SlotModel = model<ISlot>("Slot", SlotSchema);
