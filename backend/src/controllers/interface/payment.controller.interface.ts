import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";
import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PaymentHistoryDto,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
import { IRevenueData } from "../../interfaces/payment.interface";

export interface IPaymentController {
  createCheckoutSession(req: AuthenticatedRequest, res: Response): Promise<void>;
  webhook(req: Request, res: Response): Promise<void>;
  getTrainerPayments(req: AuthenticatedRequest, res: Response): Promise<Response<PaymentHistoryDto[]>>;
  getPayment(
    req: Request,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>>;
  getPurchasedProgram(req: AuthenticatedRequest, res: Response): Promise<Response<PurchasedProgram[]>>;
  getUserTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void>;
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
  getTopSellingCategoriesByTrainer(req: AuthenticatedRequest, res: Response): Promise<Response<ITopSellingCategory[]>>;
  getTopSellingProgramsByTrainer(req: AuthenticatedRequest, res: Response): Promise<Response<ITopSellingPrograms[]>>;
  getRevenueChart(
    req: Request,
    res: Response
  ): Promise<Response<IRevenueData[]>>;
  getRevenueChartByTrainer(req: AuthenticatedRequest, res: Response): Promise<Response<IRevenueData[]>>;

  getPurchasedPrograms(req: Request, res: Response): Promise<void>;
  getTrainerPurchasedPrograms(req: AuthenticatedRequest, res: Response): Promise<void>;
}
