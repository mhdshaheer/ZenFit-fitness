import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
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
  getEntrolledUsers(programId: string): Promise<number>;
  getTopSellingCategory(limit: number): Promise<ITopSellingCategory[]>;
  getTopSellingPrograms(limit: number): Promise<ITopSellingPrograms[]>;
}
