import { env } from "../../config/env.config";
import stripe from "../../shared/services/stripe-client.service";
import { Request } from "express";
import {
  CheckoutRequest,
  CheckoutResponse,
} from "../../shared/types/payment.types";
import { IPaymentService } from "../interface/payment.service.interface";
import Stripe from "stripe";
import { IPaymentRepository } from "../../repositories/interface/payment.repostitory.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IProgramRepository } from "../../repositories/interface/program.repository.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { IPayment } from "../../models/payment.model";

export class PaymentService implements IPaymentService {
  constructor(
    @inject(TYPES.PaymentRepository)
    private paymentRepository: IPaymentRepository,
    @inject(TYPES.ProgramRespository)
    private programRepository: IProgramRepository
  ) {}
  async createCheckoutSession(
    data: CheckoutRequest,
    userId: string
  ): Promise<CheckoutResponse> {
    const minimumAmount = 50;
    const finalPrice = data.price < minimumAmount ? minimumAmount : data.price;

    const platformFee = finalPrice * 0.1;
    const sellerAmount = finalPrice - platformFee;

    const program = await this.programRepository.findProgramById(data.courseId);
    if (!program) {
      throw new AppError("Couldn't find the program", HttpStatus.NOT_FOUND);
    }
    let purchaseData: Partial<IPayment> = {
      userId,
      trainerId: program.trainerId,
      programId: data.courseId,
      programName: data.courseName,

      amount: finalPrice,
      platformFee: platformFee,
      trainerEarning: sellerAmount,
    };

    const order = await this.paymentRepository.createPayment(purchaseData);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: data.courseName,
              metadata: {
                programId: data.courseId,
              },
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${env.frontend_url}/user/dashboard`,
      cancel_url: `${env.frontend_url}/cancel`,
      metadata: {
        programId: data.courseId,
        programName: data.courseName,
        trainerId: program?.trainerId.toString(),
        userId,
        price: finalPrice.toString(),
        platformFee: platformFee.toString(),
        trainerEarning: sellerAmount.toString(),
        orderDbId: order.id,
      },
    });
    console.log("Session is:", session);

    return { url: session.url! };
  }
  async processWebhook(req: Request): Promise<void> {
    const sig = req.headers["stripe-signature"] as string;

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.stripe_web_hook as string
      );
    } catch (_err) {
      throw new AppError("Invalid signature", HttpStatus.BAD_REQUEST);
    }

    await this.handleWebhook(event);
  }

  async handleWebhook(event: Stripe.Event): Promise<void> {
    const eventType = event.type;

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderDbId!;
    try {
      switch (eventType) {
        // 1️⃣ Checkout session completed
        case "checkout.session.completed": {
          const paymentIntentId = session.payment_intent as string;
          const chargeId = session.payment_intent as string;

          await this.paymentRepository.updatePaymentStatus(orderId, {
            paymentStatus: "success",
            paymentIntentId,
            chargeId,
          });

          console.log(`✅ Payment succeeded `);
          break;
        }

        case "charge.updated": {
          const charge = event.data.object as Stripe.Charge;
          const paymentIntentId = charge.payment_intent as string;
          const chargeId = charge.id;
          const status = charge.paid ? "success" : "failed";

          await this.paymentRepository.updatePaymentStatus(orderId, {
            paymentStatus: status,
            paymentIntentId,
            chargeId,
          });

          console.log(`💰 Payment ${status} for ${paymentIntentId}`);
          break;
        }

        // 3️⃣ Payment failed
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const paymentIntentId = paymentIntent.id;

          await this.paymentRepository.updatePaymentStatus(orderId, {
            paymentStatus: "failed",
            paymentIntentId,
          });

          console.log(`❌ Payment failed for ${paymentIntentId}`);
          break;
        }

        default:
          console.log(`ℹ️ Unhandled event type: ${eventType}`);
      }

      console.log("Event data:", event.data.object);
    } catch (err: any) {
      console.error("❌ Error processing webhook:", err.message || err);
    }
  }
}
