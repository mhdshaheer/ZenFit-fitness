import Stripe from "stripe";
import { Request } from "express";
import {
  CheckoutRequest,
  CheckoutResponse,
} from "../../shared/types/payment.types";
import { PaymentHistoryDto, PurchasedProgram } from "../../dtos/payment.dtos";

export interface IPaymentService {
  createCheckoutSession(
    data: CheckoutRequest,
    userId: string
  ): Promise<CheckoutResponse>;
  processWebhook(req: Request): Promise<void>;
  handleWebhook(event: Stripe.Event): Promise<void>;
  getTrainerPayments(trainerId: string): Promise<PaymentHistoryDto[]>;
  getPayments(): Promise<PaymentHistoryDto[]>;
  getPurchasedProgram(userId: string): Promise<PurchasedProgram[]>;
  getEntrolledUsers(programId: string): Promise<number>;
}
