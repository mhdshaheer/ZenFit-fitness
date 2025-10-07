import { Request, Response } from "express";
import { PaymentHistoryDto } from "../../dtos/payment.dtos";

export interface IPaymentController {
  createCheckoutSession(req: Request, res: Response): Promise<void>;
  webhook(req: Request, res: Response): Promise<void>;
  getTrainerPayments(
    req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>>;
  getPayment(
    req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>>;
}
