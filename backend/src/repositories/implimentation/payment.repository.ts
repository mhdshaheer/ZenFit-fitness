import { IPayment, PaymentModel } from "../../models/payment.model";
import { BaseRepository } from "../base.repository";
import { IPaymentRepository } from "../interface/payment.repostitory.interface";

export class PaymentRepository
  extends BaseRepository<IPayment>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }
  async createPayment(data: Partial<IPayment>): Promise<IPayment> {
    return await this.create(data);
  }
  async updatePaymentStatus(
    id: string,
    updateData: Partial<IPayment>
  ): Promise<IPayment | null> {
    return await this.update(id, updateData);
  }
}
