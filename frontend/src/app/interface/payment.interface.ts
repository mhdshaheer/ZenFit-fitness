export interface IPaymentCourse {
  price: number;
  courseName: string;
  courseId: string;
}
export interface PaymentHistory {
  _id: string;
  programName: string;
  price: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
  referenceNumber: string;
}
export interface PurchasedProgram {
  programId: string;
  title: string;
  category: string | null;
  duration: string;
  difficultyLevel: string;
  description: string;
  trainerId: string;
  amountPaid: number;
  paymentMethod: string;
  purchasedAt: Date;
}
export interface IRevenueData {
  name: string;
  revenue: number;
}
export type IRevenueFilter = 'weekly' | 'monthly' | 'yearly';

// get purchased programs:
export interface PurchasedProgramFilters {
  page?: number;
  limit?: number;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  trainerId?: string;
  categoryId?: string;
}

export interface UserDetails {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  status: string;
}

export interface TrainerDetails {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  experience: number;
}

export interface CategoryDetails {
  _id: string;
  name: string;
}

export interface ProgramDetails {
  _id: string;
  programId: string;
  title: string;
  description: string;
  category: CategoryDetails | null;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  duration: string;
  status: string;
}

export interface PaymentDetails {
  amount: number;
  platformFee: number;
  trainerEarning: number;
  currency: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentMethod: 'card' | 'wallet';
  paymentIntentId?: string;
  chargeId?: string;
  receiptUrl?: string;
}

export interface PurchasedProgram {
  _id: string;
  purchaseDate: Date;
  updatedAt: Date;
  user: UserDetails;
  trainer: TrainerDetails;
  program: ProgramDetails;
  payment: PaymentDetails;
}

export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PurchasedProgramsResponse {
  success: boolean;
  data: PurchasedProgram[];
  pagination: PaginationResult;
}
// ===purchased program ==========

// =====trainer purchased program=======
export interface TrainerPurchasedProgramFilters {
  page?: number;
  limit?: number;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  programId?: string;
}

export interface UserDetails {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  status: string;
}

export interface CategoryDetails {
  _id: string;
  name: string;
}

export interface ProgramDetails {
  _id: string;
  programId: string;
  title: string;
  description: string;
  category: CategoryDetails | null;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  duration: string;
  status: string;
}

export interface PaymentDetails {
  amount: number;
  platformFee: number;
  trainerEarning: number;
  currency: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentMethod: 'card' | 'wallet';
  paymentIntentId?: string;
  chargeId?: string;
  receiptUrl?: string;
}

export interface TrainerPurchasedProgram {
  _id: string;
  purchaseDate: Date;
  updatedAt: Date;
  user: UserDetails;
  program: ProgramDetails;
  payment: PaymentDetails;
}

export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TrainerPurchasedProgramsResponse {
  success: boolean;
  data: TrainerPurchasedProgram[];
  pagination: PaginationResult;
}

export interface TrainerEarningsSummary {
  totalEarnings: number;
  totalSales: number;
  totalRevenue: number;
  pendingAmount: number;
  successfulSales: number;
}

export interface EarningsSummaryResponse {
  success: boolean;
  data: TrainerEarningsSummary;
}
