import { Request, Response } from "express";
import { IPaymentController } from "../interface/payment.controller.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IPaymentService } from "../../services/interface/payment.service.interface";
import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PaymentHistoryDto,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
import { HttpStatus } from "../../const/statuscode.const";
import { AppError } from "../../shared/utils/appError.util";

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
  async getEntrolledUsers(
    req: Request,
    res: Response
  ): Promise<Response<{ count: number }>> {
    const { programId } = req.params;
    if (!programId) {
      throw new AppError("Program ID is missing", HttpStatus.BAD_REQUEST);
    }
    const entrolledUsers = await this.paymentService.getEntrolledUsers(
      programId
    );
    return res.status(HttpStatus.OK).json({ count: entrolledUsers });
  }
  async getTopSellingCategories(
    _req: Request,
    res: Response
  ): Promise<Response<ITopSellingCategory[]>> {
    const categories = await this.paymentService.getTopSellingCategory();
    return res.status(HttpStatus.OK).json(categories);
  }
  async getTopSellingPrograms(
    _req: Request,
    res: Response
  ): Promise<Response<ITopSellingPrograms[]>> {
    const programs = await this.paymentService.getTopSellingPrograms();
    return res.status(HttpStatus.OK).json(programs);
  }
}
