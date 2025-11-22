import { Types } from "mongoose";

// ========= REVENUE ===============
export interface IRevenueData {
  name: string;
  revenue: number;
}

export type IRevenueFilter = "weekly" | "monthly" | "yearly";

// ========= USER DETAILS ===============
export interface IUserDetails {
  _id: Types.ObjectId | string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  status: string;
}

// ========= TRAINER DETAILS ===============
export interface ITrainerDetails {
  _id: Types.ObjectId | string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  experience: number;
}

// ========= CATEGORY ===============
export interface ICategoryDetails {
  _id: Types.ObjectId | string;
  name: string;
}

// ========= PROGRAM DETAILS ===============
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

// ========= PAYMENT DETAILS ===============
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

// ========= PURCHASED PROGRAM ===============
export interface IPurchasedProgramItem {
  _id: Types.ObjectId | string;
  purchaseDate: Date;
  updatedAt: Date;
  user: IUserDetails;
  trainer: ITrainerDetails;
  program: IProgramDetails;
  payment: IPaymentDetails;
}

// ========= FILTERS ===============
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

// ========= PAGINATION ===============
export interface IPaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========= RESPONSE STRUCTURES ===============
export interface IPurchasedProgramsResponse {
  data: IPurchasedProgramItem[];
  pagination: IPaginationResult;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: IPaginationResult;
  error?: string;
}

// ========= TRAINER PURCHASED PROGRAM  ===============
export interface ITrainerPurchasedProgram {
  _id: Types.ObjectId | string;
  purchaseDate: Date;
  updatedAt: Date;
  user: IUserDetails;
  program: IProgramDetails;
  payment: IPaymentDetails;
}

export interface ITrainerPurchasedProgramFilters {
  trainerId: string;
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  programId?: string;
  page?: number;
  limit?: number;
}

export interface ITrainerPurchasedProgramsResponse {
  data: ITrainerPurchasedProgram[];
  pagination: IPaginationResult;
}
