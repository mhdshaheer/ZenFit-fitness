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
import { IRevenueData } from "../../interfaces/payment.interface";
import { HttpResponse } from "../../const/response_message.const";

export class PaymentController implements IPaymentController {
  constructor(
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService
  ) {}
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const userId = (req as any)?.user?.id;
    const response = await this._paymentService.createCheckoutSession(
      req.body,
      userId
    );
    res.json(response);
  }
  async webhook(req: Request, res: Response): Promise<void> {
    try {
      await this._paymentService.processWebhook(req);
      res.json({ received: true });
    } catch (err: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(`Webhook error: ${err.message}`);
    }
  }
  async getTrainerPayments(
    req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>> {
    const trainerId = (req as any).user.id;
    const response = await this._paymentService.getTrainerPayments(trainerId);
    return res.status(HttpStatus.OK).json(response);
  }
  async getPayment(
    _req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>> {
    const response = await this._paymentService.getPayments();
    return res.status(HttpStatus.OK).json(response);
  }
  async getPurchasedProgram(
    req: Request,
    res: Response
  ): Promise<Response<PurchasedProgram[]>> {
    const userId = (req as any).user.id;
    const purchasedPrograms = await this._paymentService.getPurchasedProgram(
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
      throw new AppError(
        HttpResponse.PROGRAM_ID_MISSING,
        HttpStatus.BAD_REQUEST
      );
    }
    const entrolledUsers = await this._paymentService.getEntrolledUsers(
      programId
    );
    return res.status(HttpStatus.OK).json({ count: entrolledUsers });
  }
  async getTopSellingCategories(
    _req: Request,
    res: Response
  ): Promise<Response<ITopSellingCategory[]>> {
    const categories = await this._paymentService.getTopSellingCategory();
    return res.status(HttpStatus.OK).json(categories);
  }
  async getTopSellingPrograms(
    _req: Request,
    res: Response
  ): Promise<Response<ITopSellingPrograms[]>> {
    const programs = await this._paymentService.getTopSellingPrograms();
    return res.status(HttpStatus.OK).json(programs);
  }
  async getTopSellingCategoriesByTrainer(
    req: Request,
    res: Response
  ): Promise<Response<ITopSellingCategory[]>> {
    const trainerId = (req as any).user.id;
    const categoies = await this._paymentService.getTopSellingCategoryByTrainer(
      trainerId
    );
    return res.status(HttpStatus.OK).json(categoies);
  }
  async getTopSellingProgramsByTrainer(
    req: Request,
    res: Response
  ): Promise<Response<ITopSellingPrograms[]>> {
    const trainerId = (req as any).user.id;
    const programs = await this._paymentService.getTopSellingProgramsByTrainer(
      trainerId
    );
    return res.status(HttpStatus.OK).json(programs);
  }
  async getRevenueChart(
    req: Request,
    res: Response
  ): Promise<Response<IRevenueData[]>> {
    const { filter } = req.query;

    const validFilters = ["weekly", "monthly", "yearly"];
    const selectedFilter = validFilters.includes(filter as string)
      ? (filter as "weekly" | "monthly" | "yearly")
      : "monthly";
    const filterData = await this._paymentService.getRevenueChart(
      selectedFilter
    );
    return res.status(HttpStatus.OK).json(filterData);
  }
  async getRevenueChartByTrainer(
    req: Request,
    res: Response
  ): Promise<Response<IRevenueData[]>> {
    const trainerId = (req as any).user.id;
    const { filter } = req.query;

    const validFilters = ["weekly", "monthly", "yearly"];
    const selectedFilter = validFilters.includes(filter as string)
      ? (filter as "weekly" | "monthly" | "yearly")
      : "monthly";
    const filterData = await this._paymentService.getRevenueChartByTrainer(
      trainerId,
      selectedFilter
    );
    return res.status(HttpStatus.OK).json(filterData);
  }
}
