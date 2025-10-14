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
  IRevenueData,
  IRevenueFilter,
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
}
