import { env } from "../../config/env.config";
import stripe from "../../shared/services/stripe-client.service";
import {
  CheckoutRequest,
  CheckoutResponse,
} from "../../shared/types/payment.types";
import { IPaymentService } from "../interface/payment.service.interface";

export class PaymentService implements IPaymentService {
  async createCheckoutSession(
    data: CheckoutRequest,
    userId: string
  ): Promise<CheckoutResponse> {
    // Ensure minimum amount (Stripe requires ≥ ₹50)
    const minimumAmount = 50;
    const finalPrice = data.price < minimumAmount ? minimumAmount : data.price;

    // Calculate platform fee (10% of total price)
    const platformFee = finalPrice * 0.1;
    const sellerAmount = finalPrice - platformFee;

    console.log("price from user :", data.price, "and ", minimumAmount);
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // ✅ Added UPI (works for INR)
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: data.courseName,
              metadata: {
                productId: data.courseId,
              },
            },
            unit_amount: Math.round(finalPrice * 100), // ✅ Must be integer (in paise)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${env.frontend_url}/user/dashboard`,
      cancel_url: `${env.frontend_url}/cancel`,
      metadata: {
        productId: data.courseId,
        courseName: data.courseName,
        userId,
        price: finalPrice.toString(),
        platformFee: platformFee.toString(),
        sellerAmount: sellerAmount.toString(),
      },
    });

    console.log("✅ Checkout session created:", session.id);
    console.log(
      `💰 Platform fee: ₹${platformFee}, Seller amount: ₹${sellerAmount}`
    );

    return { url: session.url! };
  }

  async handleWebhook(event: any): Promise<void> {
    console.log("i am in webHook service");
    console.log("event type :", event.type);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("session is :", session);
      //   await this.repo.savePaymentLog(session);
    }
  }
}
