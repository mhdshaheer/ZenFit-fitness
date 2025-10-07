import Stripe from "stripe";
import { Request } from "express";
import {
  CheckoutRequest,
  CheckoutResponse,
} from "../../shared/types/payment.types";

export interface IPaymentService {
  createCheckoutSession(
    data: CheckoutRequest,
    userId: string
  ): Promise<CheckoutResponse>;
  processWebhook(req: Request): Promise<void>;
  handleWebhook(event: Stripe.Event): Promise<void>;
}
