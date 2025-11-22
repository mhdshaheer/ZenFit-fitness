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
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { IProgramRepository } from "../../repositories/interface/program.repository.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpStatus } from "../../const/statuscode.const";
import { IPayment } from "../../models/payment.model";
import {
  ITopSellingCategory,
  ITopSellingPrograms,
  PaymentHistoryDto,
  PurchasedProgram,
} from "../../dtos/payment.dtos";
import {
  mapToPaymentHistoryAdminDto,
  mapToPaymentHistoryDto,
} from "../../mapper/payment.mapper";
import {
  IRevenueFilter,
  IRevenueData,
  IApiResponse,
  IPurchasedProgramFilters,
  ITrainerPurchasedProgramFilters,
} from "../../interfaces/payment.interface";
import logger from "../../shared/services/logger.service";

@injectable()
export class PaymentService implements IPaymentService {
  @inject(TYPES.PaymentRepository)
  private readonly _paymentRepository!: IPaymentRepository;
  @inject(TYPES.ProgramRespository)
  private readonly programRepository!: IProgramRepository;
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

    const order = await this._paymentRepository.createPayment(purchaseData);

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
      success_url: `${env.frontend_url}/user/payment-success`,
      cancel_url: `${env.frontend_url}/user/payment-failed`,
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
    } catch {
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
        case "checkout.session.completed": {
          const paymentIntentId = session.payment_intent as string;
          const chargeId = session.payment_intent as string;

          await this._paymentRepository.updatePaymentStatus(orderId, {
            paymentStatus: "success",
            paymentIntentId,
            chargeId,
          });

          logger.info(`Payment succeeded `);
          break;
        }

        case "charge.updated": {
          const charge = event.data.object as Stripe.Charge;
          const paymentIntentId = charge.payment_intent as string;
          const chargeId = charge.id;
          const status = charge.paid ? "success" : "failed";

          await this._paymentRepository.updatePaymentStatus(orderId, {
            paymentStatus: status,
            paymentIntentId,
            chargeId,
          });
          break;
        }
        case "payment_intent.payment_failed": {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const paymentIntentId = paymentIntent.id;

          await this._paymentRepository.updatePaymentStatus(orderId, {
            paymentStatus: "failed",
            paymentIntentId,
          });
          break;
        }

        default:
          logger.info(`Unhandled event type: ${eventType}`);
      }

      console.log("Event data:", event.data.object);
    } catch (err: unknown) {
      if (err instanceof Error) {
        logger.error("Error processing webhook:", err.message);
      } else {
        logger.error("Error processing webhook:", err);
      }
    }
  }

  async getTrainerPayments(trainerId: string): Promise<PaymentHistoryDto[]> {
    const payments = await this._paymentRepository.getProgramsByTrainerId(
      trainerId
    );
    const paymentDto = payments.map(mapToPaymentHistoryDto);
    return paymentDto;
  }
  async getPayments(): Promise<PaymentHistoryDto[]> {
    const payments = await this._paymentRepository.getPayments();
    const paymentDto = payments.map(mapToPaymentHistoryAdminDto);
    return paymentDto;
  }

  async getPurchasedProgram(userId: string): Promise<PurchasedProgram[]> {
    const programs = await this._paymentRepository.findPurchasedProgram(userId);
    return programs;
  }

  async getUserTransactionHistory(
    userId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ data: PurchasedProgram[]; total: number; page: number; limit: number; totalPages: number }> {
    const offset = (page - 1) * limit;
    const programs = await this._paymentRepository.findPurchasedProgramWithPagination(
      userId,
      limit,
      offset,
      search,
      status
    );
    const total = await this._paymentRepository.countPurchasedPrograms(userId, search, status);
    const totalPages = Math.ceil(total / limit);

    return {
      data: programs,
      total,
      page,
      limit,
      totalPages
    };
  }

  async getEntrolledUsers(programId: string): Promise<number> {
    const count = await this._paymentRepository.getEntrolledUsers(programId);
    return count;
  }

  async getTopSellingCategory(): Promise<ITopSellingCategory[]> {
    const limit = 5;
    const categoies = await this._paymentRepository.getTopSellingCategory(
      limit
    );
    return categoies;
  }
  async getTopSellingPrograms(): Promise<ITopSellingPrograms[]> {
    const limit = 5;
    const programs = await this._paymentRepository.getTopSellingPrograms(limit);
    return programs;
  }
  async getTopSellingCategoryByTrainer(
    trainerId: string
  ): Promise<ITopSellingCategory[]> {
    const limit = 5;
    const categoies =
      await this._paymentRepository.getTopSellingCategoryByTrainer(
        trainerId,
        limit
      );
    return categoies;
  }
  async getTopSellingProgramsByTrainer(
    trainerId: string
  ): Promise<ITopSellingPrograms[]> {
    const limit = 5;
    const programs =
      await this._paymentRepository.getTopSellingProgramsByTrainer(
        trainerId,
        limit
      );
    return programs;
  }
  async getRevenueChart(filter: IRevenueFilter): Promise<IRevenueData[]> {
    const chartData = await this._paymentRepository.getRevenueByFilter(filter);
    return chartData;
  }
  async getRevenueChartByTrainer(
    trainerId: string,
    filter: IRevenueFilter
  ): Promise<IRevenueData[]> {
    const chartData = await this._paymentRepository.getRevenueByFilterByTrainer(
      trainerId,
      filter
    );
    return chartData;
  }
  async getPurchasedPrograms(
    filters: IPurchasedProgramFilters
  ): Promise<IApiResponse> {
    const result = await this._paymentRepository.getPurchasedPrograms(filters);

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }

  async getTrainerPurchasedPrograms(
    filters: ITrainerPurchasedProgramFilters
  ): Promise<IApiResponse> {
    const result = await this._paymentRepository.getTrainerPurchasedPrograms(
      filters
    );

    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
    };
  }
}
