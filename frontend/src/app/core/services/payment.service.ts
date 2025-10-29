import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  IPaymentCourse,
  IRevenueData,
  IRevenueFilter,
  PaymentHistory,
  PurchasedProgram,
  PurchasedProgramFilters,
  PurchasedProgramsResponse,
  TrainerPurchasedProgramFilters,
  TrainerPurchasedProgramsResponse,
} from '../../interface/payment.interface';
import { Observable } from 'rxjs';
import { ITopCategory } from '../../interface/category.interface';
import { ITopPrograms } from '../../interface/program.interface';
import { PaymentRoutes } from '../constants/api-routes.const';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly _http = inject(HttpClient);
  private readonly _api = environment.apiUrl + PaymentRoutes.BASE;

  createCheckout(data: IPaymentCourse) {
    return this._http.post<{ url: string }>(
      this._api + PaymentRoutes.CREATE_CHECKOUT,
      data
    );
  }
  getHistory() {
    return this._http.get<PaymentHistory[]>(
      this._api + PaymentRoutes.HISTORY_TRAINER
    );
  }
  getHistoryAdmin() {
    return this._http.get<PaymentHistory[]>(
      this._api + PaymentRoutes.HISTORY_ADMIN
    );
  }
  getTopCategories(): Observable<ITopCategory[]> {
    return this._http.get<ITopCategory[]>(
      this._api + PaymentRoutes.TOP_CATEGORIES
    );
  }
  getTopPrograms(): Observable<ITopPrograms[]> {
    return this._http.get<ITopPrograms[]>(
      this._api + PaymentRoutes.TOP_PROGRAMS
    );
  }
  getTopCategoriesByTrainer(): Observable<ITopCategory[]> {
    return this._http.get<ITopCategory[]>(
      this._api + PaymentRoutes.TOP_CATEGORIES_TRAINER
    );
  }
  getTopProgramsByTrainer(): Observable<ITopPrograms[]> {
    return this._http.get<ITopPrograms[]>(
      this._api + PaymentRoutes.TOP_PROGRAMS_TRAINER
    );
  }
  getPurchasedPrograms(): Observable<PurchasedProgram[]> {
    return this._http.get<PurchasedProgram[]>(
      this._api + PaymentRoutes.PURCHASED
    );
  }
  getEntrolledUsers(programId: string): Observable<{ count: number }> {
    return this._http.get<{ count: number }>(
      this._api + PaymentRoutes.ENTROLLED(programId)
    );
  }
  getRevenueChart(filter: IRevenueFilter): Observable<IRevenueData[]> {
    const params = { filter };
    return this._http.get<IRevenueData[]>(
      this._api + PaymentRoutes.REVENUE_CHART_ADMIN,
      {
        params,
      }
    );
  }
  getRevenueChartByTrainer(filter: IRevenueFilter): Observable<IRevenueData[]> {
    const params = { filter };
    return this._http.get<IRevenueData[]>(
      this._api + PaymentRoutes.REVENUE_CHART_TRAINER,
      {
        params,
      }
    );
  }

  getPurchasedProgramsOnAdmin(
    filters: PurchasedProgramFilters
  ): Observable<PurchasedProgramsResponse> {
    let params = new HttpParams();

    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());
    if (filters.paymentStatus)
      params = params.set('paymentStatus', filters.paymentStatus);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.trainerId) params = params.set('trainerId', filters.trainerId);
    if (filters.categoryId)
      params = params.set('categoryId', filters.categoryId);

    return this._http.get<PurchasedProgramsResponse>(
      `${this._api}/purchased-programs`,
      { params }
    );
  }

  getTrainerPurchasedPrograms(
    filters: TrainerPurchasedProgramFilters
  ): Observable<TrainerPurchasedProgramsResponse> {
    let params = new HttpParams();

    if (filters.page !== undefined)
      params = params.set('page', filters.page.toString());
    if (filters.limit !== undefined)
      params = params.set('limit', filters.limit.toString());
    if (filters.paymentStatus)
      params = params.set('paymentStatus', filters.paymentStatus);
    if (filters.startDate) params = params.set('startDate', filters.startDate);
    if (filters.endDate) params = params.set('endDate', filters.endDate);
    if (filters.search) params = params.set('search', filters.search);
    if (filters.programId) params = params.set('programId', filters.programId);

    return this._http.get<TrainerPurchasedProgramsResponse>(
      `${this._api}/trainer/purchased-programs`,
      { params }
    );
  }
}
