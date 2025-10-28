import { model, Schema, Types } from "mongoose";

export interface IBooking extends Document {
  slotId: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  day: string;
  status: "booked" | "cancelled" | "completed";
}

const BookingSchema = new Schema<IBooking>(
  {
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    day: { type: String, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked",
    },
  },
  { timestamps: true }
);

export const BookingModel = model<IBooking>("Booking", BookingSchema);
