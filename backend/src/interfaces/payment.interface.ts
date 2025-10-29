import { Types } from "mongoose";

export interface IRevenueData {
  name: string;
  revenue: number;
}
export type IRevenueFilter = "weekly" | "monthly" | "yearly";

// ========= PURCHASED PROGRAM ===============
export interface IUserDetails {
  _id: Types.ObjectId | string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  status: string;
}

export interface ITrainerDetails {
  _id: Types.ObjectId | string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  experience: number;
}

export interface ICategoryDetails {
  _id: Types.ObjectId | string;
  name: string;
}

export interface IProgramDetails {
  _id: Types.ObjectId | string;
  programId: string;
  title: string;
  description: string;
  category: ICategoryDetails;
  difficultyLevel: "Beginner" | "Intermediate" | "Advanced";
  price: number;
  duration: string;
  status: string;
}

export interface IPaymentDetails {
  amount: number;
  platformFee: number;
  trainerEarning: number;
  currency: string;
  paymentStatus: "pending" | "success" | "failed";
  paymentMethod: "card" | "wallet";
  paymentIntentId?: string;
  chargeId?: string;
  receiptUrl?: string;
}

export interface IPurchasedProgramItem {
  _id: Types.ObjectId | string;
  purchaseDate: Date;
  updatedAt: Date;
  user: IUserDetails;
  trainer: ITrainerDetails;
  program: IProgramDetails;
  payment: IPaymentDetails;
}

export interface IPurchasedProgramFilters {
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  trainerId?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface IPaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPurchasedProgramsResponse {
  data: IPurchasedProgramItem[];
  pagination: IPaginationResult;
}

// interfaces/response.interface.ts
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

// ========= PURCHASED PROGRAM ===============
