import { Request, Response } from "express";
import { IPaymentController } from "../interface/payment.controller.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IPaymentService } from "../../services/interface/payment.service.interface";

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
    console.log("i am reached on webhook controller");
    try {
      await this.paymentService.processWebhook(req);
      res.json({ received: true });
    } catch (err: any) {
      console.error("❌ Webhook error:", err.message);
      res.status(500).send(`Webhook error: ${err.message}`);
    }
  }
}
