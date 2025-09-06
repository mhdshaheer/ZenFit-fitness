import mongoose, { Model } from "mongoose";
import { IUser } from "../interfaces/user.interface";
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    fullName: {
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
      type: String,
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
    resume: { type: String },
    languages: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["inactive", "pending", "active", "blocked"],
      default: "active",
    },
    googleId: {
      type: String,
      index: true,
    },
    profileImage: {
      type: String,
    },
  },
  { timestamps: true }
);

export const UserModel: Model<IUser> = mongoose.model<IUser>(
  "User",
  userSchema
);
