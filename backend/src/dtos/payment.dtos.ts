export interface PaymentHistoryDto {
  _id: string;
  status: string;
  price: number;
  programName: string;
  referenceNumber: string;
  date: Date;
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

export interface ITopSellingCategory {
  _id: string;
  categoryName: string;
  totalPurchases: number;
  totalRevenue: number;
}

export interface ITopSellingPrograms {
  _id: string;
  courseName: string;
  totalPurchases: number;
  totalRevenue: number;
}
