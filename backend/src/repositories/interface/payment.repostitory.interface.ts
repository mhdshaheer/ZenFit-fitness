import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
import {
  IPurchasedProgramFilters,
  IPurchasedProgramsResponse,
  IRevenueData,
  IRevenueFilter,
} from "../../interfaces/payment.interface";
import { IPayment } from "../../models/payment.model";

export interface IPaymentRepository {
  createPayment(data: Partial<IPayment>): Promise<IPayment>;
  updatePaymentStatus(
    id: string,
    updateData: Partial<IPayment>
  ): Promise<IPayment | null>;
  getProgramsByTrainerId(trainerId: string): Promise<IPayment[]>;
  getPayments(): Promise<IPayment[]>;
  findPurchasedProgram(userId: string): Promise<PurchasedProgram[]>;
  getPurchasedProgramIds(
    userId: string
  ): Promise<{ _id: string; programId: string }[]>;
  getEntrolledUsers(programId: string): Promise<number>;

  getTopSellingCategory(limit: number): Promise<ITopSellingCategory[]>;
  getTopSellingPrograms(limit: number): Promise<ITopSellingPrograms[]>;
  getTopSellingCategoryByTrainer(
    trainerId: string,
    limit: number
  ): Promise<ITopSellingCategory[]>;
  getTopSellingProgramsByTrainer(
    trainerId: string,
    limit: number
  ): Promise<ITopSellingPrograms[]>;
  getRevenueByFilter(filter: IRevenueFilter): Promise<IRevenueData[]>;
  getRevenueByFilterByTrainer(
    trainerId: string,
    filter: IRevenueFilter
  ): Promise<IRevenueData[]>;
  getPurchasedPrograms(
    filters: IPurchasedProgramFilters
  ): Promise<IPurchasedProgramsResponse>;
}
