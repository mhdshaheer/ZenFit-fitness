import Stripe from "stripe";
import { Request } from "express";
import {
  CheckoutRequest,
  CheckoutResponse,
} from "../../shared/types/payment.types";
import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PaymentHistoryDto,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
import {
  IApiResponse,
  IPurchasedProgramFilters,
  IRevenueData,
  IRevenueFilter,
  ITrainerPurchasedProgramFilters,
} from "../../interfaces/payment.interface";

export interface IPaymentService {
  createCheckoutSession(
    data: CheckoutRequest,
    userId: string
  ): Promise<CheckoutResponse>;
  processWebhook(req: Request): Promise<void>;
  handleWebhook(event: Stripe.Event): Promise<void>;
  getTrainerPayments(trainerId: string): Promise<PaymentHistoryDto[]>;
  getPayments(): Promise<PaymentHistoryDto[]>;
  getPurchasedProgram(userId: string): Promise<PurchasedProgram[]>;
  getUserTransactionHistory(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ data: PurchasedProgram[]; total: number; page: number; limit: number; totalPages: number }>;
  getEntrolledUsers(programId: string): Promise<number>;
  getTopSellingCategory(): Promise<ITopSellingCategory[]>;
  getTopSellingPrograms(): Promise<ITopSellingPrograms[]>;
  getTopSellingCategoryByTrainer(
    trainerId: string
  ): Promise<ITopSellingCategory[]>;
  getTopSellingProgramsByTrainer(
    trainerId: string
  ): Promise<ITopSellingPrograms[]>;
  getRevenueChart(filter: IRevenueFilter): Promise<IRevenueData[]>;
  getRevenueChartByTrainer(
    trainerId: string,
    filter: IRevenueFilter
  ): Promise<IRevenueData[]>;
  getPurchasedPrograms(
    filters: IPurchasedProgramFilters
  ): Promise<IApiResponse>;
  getTrainerPurchasedPrograms(
    filters: ITrainerPurchasedProgramFilters
  ): Promise<IApiResponse>;
}
