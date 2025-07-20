import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  username?: string;
  email: string;
  password?: string;
  dob?: Date;
  gender?: "male" | "female" | "other";
  role?: "admin" | "trainer" | "user";
  status?: string;
}
