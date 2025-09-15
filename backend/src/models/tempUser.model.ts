import mongoose, { Schema, Document } from "mongoose";

// ============================= User ===============================================
export interface ITempUser extends Document {
  email: string;
  otp: string;
  payload: {
    username: string;
    email: string;
    password: string; // already hashed
    dob: Date;
    gender: string;
    role: string;
  };
  createdAt: Date;
}

const tempUserSchema = new Schema<ITempUser>({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  payload: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now, index: { expires: 300 } }, // TTL 5 min
});

export const TempUserModel = mongoose.model<ITempUser>(
  "TempUser",
  tempUserSchema
);
