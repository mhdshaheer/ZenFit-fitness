import { Schema, model, Document, ObjectId } from "mongoose";

export interface IBooking extends Document {
  bookingId: string;
  userId: ObjectId;
  sessionId: ObjectId;
  paymentStatus: "Pending" | "Completed" | "Failed";
  attendanceStatus: "Booked" | "Joined" | "Missed" | "Cancelled";
  createdAt: Date;
  updatedAt: Date;
}
const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    attendanceStatus: {
      type: String,
      enum: ["Booked", "Joined", "Missed", "Cancelled"],
      default: "Booked",
    },
  },
  { timestamps: true }
);

export const BookingModel = model<IBooking>("Booking", BookingSchema);
