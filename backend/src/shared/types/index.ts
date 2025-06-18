import { Types } from "mongoose";
export interface IUser {
  _id: string;
  username: string;
  name: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  status: "active" | "blocked";
  role: "user" | "trainer";
  phone: number;
  profilePicture?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt: Date;
}
