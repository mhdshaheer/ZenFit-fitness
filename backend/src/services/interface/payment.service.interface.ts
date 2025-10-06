import {
  CheckoutRequest,
  CheckoutResponse,
} from "../../shared/types/payment.types";

export interface IPaymentService {
  createCheckoutSession(
    data: CheckoutRequest,
    userId: string
  ): Promise<CheckoutResponse>;
  handleWebhook(event: any): Promise<void>;
}
