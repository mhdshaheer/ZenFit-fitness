import { Document, model, Schema, Types } from "mongoose";

export interface IBookingSnapshot {
  slotDate: Date;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  timezone: string;
  programId: Types.ObjectId;
  trainerId: Types.ObjectId;
  templateId: Types.ObjectId;
  capacity: number;
  programTitle?: string;
  programDuration?: string;
  programDifficulty?: string;
}

export interface IBooking extends Document {
  slotId: Types.ObjectId; // references SlotInstance
  userId: Types.ObjectId;
  templateId: Types.ObjectId;
  date: Date;
  day: string;
  status: "booked" | "cancelled" | "completed";
  snapshot: IBookingSnapshot;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "SlotInstance",
      required: true,
      index: true,
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "SlotTemplate",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true },
    day: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
      index: true,
    },
    snapshot: {
      slotDate: { type: Date, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      startMinutes: { type: Number, required: true },
      endMinutes: { type: Number, required: true },
      timezone: { type: String, required: true },
      programId: { type: Schema.Types.ObjectId, ref: "Program", required: true },
      trainerId: { type: Schema.Types.ObjectId, ref: "Trainer", required: true },
      templateId: { type: Schema.Types.ObjectId, ref: "SlotTemplate", required: true },
      capacity: { type: Number, required: true },
      programTitle: { type: String },
      programDuration: { type: String },
      programDifficulty: { type: String },
    },
  },
  { timestamps: true }
);

BookingSchema.index({ "snapshot.slotDate": 1, userId: 1 });

export const BookingModel = model<IBooking>("Booking", BookingSchema);
