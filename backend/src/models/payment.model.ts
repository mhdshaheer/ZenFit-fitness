import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId | string;
  trainerId: Types.ObjectId | string;
  programId: Types.ObjectId | string;
  programName: string;

  amount: number;
  platformFee: number;
  trainerEarning: number;
  currency: string;

  paymentStatus: "pending" | "success" | "failed";
  paymentIntentId?: string;
  chargeId?: string;
  receiptUrl?: string;
  paymentMethod?: "card" | "wallet";

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerId: {
      type: Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    programName: { type: String, required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    trainerEarning: { type: Number, required: true },
    currency: { type: String, default: "inr" },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },

    paymentIntentId: String,
    chargeId: String,
    receiptUrl: String,
    paymentMethod: { type: String, default: "card", enum: ["card", "wallet"] },
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model<IPayment>("Payment", paymentSchema);
