import { Request, Response } from "express";
import { IPaymentController } from "../interface/payment.controller.interface";
import { inject, injectable } from "inversify";
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
import {
  IPurchasedProgramFilters,
  IRevenueData,
  ITrainerPurchasedProgramFilters,
} from "../../interfaces/payment.interface";
import { HttpResponse } from "../../const/response_message.const";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

@injectable()
export class PaymentController implements IPaymentController {
  constructor(
    @inject(TYPES.PaymentService)
    private readonly _paymentService: IPaymentService
  ) { }
  async createCheckoutSession(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: HttpResponse.UNAUTHORIZED });
      return;
    }
    const response = await this._paymentService.createCheckoutSession(
      req.body,
      userId
    );
    res.status(HttpStatus.OK).json(response);
  }
  async webhook(req: Request, res: Response): Promise<void> {
    try {
      await this._paymentService.processWebhook(req);
      res.status(HttpStatus.OK).json({ received: true });
    } catch (err) {
      const error = err as Error;
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(`Webhook error: ${error.message}`);
    }
  }
  async getTrainerPayments(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<PaymentHistoryDto[]>> {
    const trainerId = req.user?.id;
    if (!trainerId) {
      throw new AppError(HttpResponse.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
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
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<PurchasedProgram[]>> {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(HttpResponse.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const purchasedPrograms = await this._paymentService.getPurchasedProgram(
      userId
    );
    return res.status(HttpStatus.OK).json(purchasedPrograms);
  }

  async getUserTransactionHistory(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: HttpResponse.UNAUTHORIZED });
        return;
      }

      // Validate and sanitize pagination parameters
      let page = Number.parseInt(req.query.page as string, 10) || 1;
      let limit = Number.parseInt(req.query.limit as string, 10) || 10;

      // Ensure page is at least 1
      page = Math.max(1, page);

      // Limit the maximum items per page to prevent performance issues
      limit = Math.min(Math.max(1, limit), 100);

      const search = req.query.search as string || '';
      const status = req.query.status as string || '';

      // Validate status parameter
      const validStatuses = ['all', 'success', 'pending', 'failed'];
      const validatedStatus = validStatuses.includes(status) ? status : 'all';

      const startTime = Date.now();
      const result = await this._paymentService.getUserTransactionHistory(
        userId,
        page,
        limit,
        search.trim(),
        validatedStatus
      );
      const endTime = Date.now();

      res.status(HttpStatus.OK).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Error in getUserTransactionHistory:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: HttpResponse.TRANSACTION_HISTORY_FETCH_FAILED,
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : HttpResponse.SERVER_ERROR,
      });
    }
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
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<ITopSellingCategory[]>> {
    const trainerId = req.user?.id;
    if (!trainerId) {
      throw new AppError(HttpResponse.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    const categoies = await this._paymentService.getTopSellingCategoryByTrainer(
      trainerId
    );
    return res.status(HttpStatus.OK).json(categoies);
  }
  async getTopSellingProgramsByTrainer(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<ITopSellingPrograms[]>> {
    const trainerId = req.user?.id;
    if (!trainerId) {
      throw new AppError(HttpResponse.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
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
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<IRevenueData[]>> {
    const trainerId = req.user?.id;
    if (!trainerId) {
      throw new AppError(HttpResponse.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
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

  // Get purchased program on adminside:
  async getPurchasedPrograms(req: Request, res: Response): Promise<void> {
    const {
      page = "1",
      limit = "20",
      paymentStatus,
      startDate,
      endDate,
      search,
      trainerId,
      categoryId,
    } = req.query;

    const filters: IPurchasedProgramFilters = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      paymentStatus: paymentStatus as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
      trainerId: trainerId as string,
      categoryId: categoryId as string,
    };

    const result = await this._paymentService.getPurchasedPrograms(filters);

    res.status(HttpStatus.OK).json(result);
  }

  async getTrainerPurchasedPrograms(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    const trainerId = req.user?.id;

    if (!trainerId) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: HttpResponse.UNAUTHORIZED,
      });
      return;
    }

    const {
      page = "1",
      limit = "10",
      paymentStatus,
      startDate,
      endDate,
      search,
      programId,
    } = req.query;

    const filters: ITrainerPurchasedProgramFilters = {
      trainerId,
      page: Number.parseInt(page as string, 10),
      limit: Number.parseInt(limit as string, 10),
      paymentStatus: paymentStatus as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      search: search as string,
      programId: programId as string,
    };

    const result = await this._paymentService.getTrainerPurchasedPrograms(
      filters
    );

    res.status(200).json(result);
  }
}
