import { Request, Response } from "express";
import { IPaymentController } from "../interface/payment.controller.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IPaymentService } from "../../services/interface/payment.service.interface";
import stripe from "../../shared/services/stripe-client.service";
import { env } from "../../config/env.config";

export class PaymentController implements IPaymentController {
  constructor(
    @inject(TYPES.PaymentService) private paymentService: IPaymentService
  ) {}
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.user?.id;
    const response = await this.paymentService.createCheckoutSession(
      req.body,
      userId
    );
    res.json(response);
  }
  async webhook(req: Request, res: Response): Promise<void> {
    try {
      const sig = req.headers["stripe-signature"] as string;
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.stripe_web_hook as string
      );

      console.log("The event I recieved :", event);
      await this.paymentService.handleWebhook(event);

      res.json({ received: true });
    } catch (err: any) {
      console.error("❌ Webhook error:", err.message);
      res.status(500).send(`Webhook error: ${err.message}`);
    }
  }
}
