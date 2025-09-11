import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  fullName?: string;
  username?: string;
  email: string;
  password?: string;
  phone?: string;
  dob?: Date;
  gender?: "male" | "female" | "other";
  role?: "admin" | "trainer" | "user";
  status?: string;
  profileImage?: string;
  resume?: string;
  resumeVerified?: boolean;
}

export interface IPassword {
  currentPassword: string;
  newPassword: string;
}
