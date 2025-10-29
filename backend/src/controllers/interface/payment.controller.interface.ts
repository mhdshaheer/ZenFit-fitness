import { Request, Response } from "express";
import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PaymentHistoryDto,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
import { IRevenueData } from "../../interfaces/payment.interface";

export interface IPaymentController {
  createCheckoutSession(req: Request, res: Response): Promise<void>;
  webhook(req: Request, res: Response): Promise<void>;
  getTrainerPayments(
    req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>>;
  getPayment(
    req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>>;
  getPurchasedProgram(
    req: Request,
    res: Response
  ): Promise<Response<PurchasedProgram[]>>;
  getEntrolledUsers(
    req: Request,
    res: Response
  ): Promise<Response<{ count: number }>>;
  getTopSellingCategories(
    req: Request,
    res: Response
  ): Promise<Response<ITopSellingCategory[]>>;
  getTopSellingPrograms(
    req: Request,
    res: Response
  ): Promise<Response<ITopSellingPrograms[]>>;
  getTopSellingCategoriesByTrainer(
    req: Request,
    res: Response
  ): Promise<Response<ITopSellingCategory[]>>;
  getTopSellingProgramsByTrainer(
    req: Request,
    res: Response
  ): Promise<Response<ITopSellingPrograms[]>>;
  getRevenueChart(
    req: Request,
    res: Response
  ): Promise<Response<IRevenueData[]>>;
  getRevenueChartByTrainer(
    req: Request,
    res: Response
  ): Promise<Response<IRevenueData[]>>;

  getPurchasedPrograms(req: Request, res: Response): Promise<void>;
  getTrainerPurchasedPrograms(req: Request, res: Response): Promise<void>;
}
