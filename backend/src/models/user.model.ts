import mongoose, { Model } from "mongoose";
import { IUser } from "../interfaces/user.interface";
const userSchema = new mongoose.Schema(
  {
    username: {
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
    address: {
      type: String,
    },
    role: {
      type: String,
      enum: ["admin", "user", "trainer"],
    },
    experience: {
      type: Number,
    },
    languages: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["inactive", "pending", "active", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> = mongoose.model<IUser>(
  "User",
  userSchema
);
