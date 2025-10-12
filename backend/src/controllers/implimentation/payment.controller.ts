import { Request, Response } from "express";
import { IPaymentController } from "../interface/payment.controller.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IPaymentService } from "../../services/interface/payment.service.interface";
import { PaymentHistoryDto, PurchasedProgram } from "../../dtos/payment.dtos";
import { HttpStatus } from "../../const/statuscode.const";

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
  async getTrainerPayments(
    req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>> {
    const trainerId = (req as any).user.id;
    const response = await this.paymentService.getTrainerPayments(trainerId);
    return res.status(HttpStatus.OK).json(response);
  }
  async getPayment(
    _req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>> {
    const response = await this.paymentService.getPayments();
    return res.status(HttpStatus.OK).json(response);
  }
  async getPurchasedProgram(
    req: Request,
    res: Response
  ): Promise<Response<PurchasedProgram[]>> {
    const userId = (req as any).user.id;
    const purchasedPrograms = await this.paymentService.getPurchasedProgram(
      userId
    );
    return res.status(HttpStatus.OK).json(purchasedPrograms);
  }
}
