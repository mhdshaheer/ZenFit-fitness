import { Types } from "mongoose";

export interface IUser {
  _id?: Types.ObjectId;
  fullName?: string;
  username?: string;
  email: string;
  password?: string;
  phone?: string;
  dob?: Date;
  gender?: string;
  role?: "admin" | "trainer" | "user";
  status?: string;
  languages?: string[];
  profileImage?: string;
  resume?: string;
  resumeVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  googleId?: string;
}

export interface IPassword {
  currentPassword: string;
  newPassword: string;
}

export interface GetUsersParams {
  filter?: Record<string, unknown>;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 1 | -1;
  role?: string;
}

export interface ILoggedUser {
  userId: string;
  role: "user" | "trainer" | "admin";
}

export interface IGoogleProfile {
  id: string;
  displayName: string;
  emails: { value: string; verified: boolean }[];
  photos?: { value: string }[];
}
