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
export type IRevenueFilter = "weekly" | "monthly" | "yearly"
