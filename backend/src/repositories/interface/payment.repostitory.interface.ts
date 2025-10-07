import { IPayment } from "../../models/payment.model";

export interface IPaymentRepository {
  createPayment(data: Partial<IPayment>): Promise<IPayment>;
  updatePaymentStatus(
    id: string,
    updateData: Partial<IPayment>
  ): Promise<IPayment | null>;
  getProgramsByTrainerId(trainerId: string): Promise<IPayment[]>;
  getPayments(): Promise<IPayment[]>;
}
