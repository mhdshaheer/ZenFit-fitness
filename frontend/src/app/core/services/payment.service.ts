import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  IPaymentCourse,
  PaymentHistory,
  PurchasedProgram,
} from '../../interface/payment.interface';
import { Observable } from 'rxjs';
import { ITopCategory } from '../../interface/category.interface';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private api = environment.apiUrl + '/payment';

  createCheckout(data: IPaymentCourse) {
    return this.http.post<{ url: string }>(
      `${this.api}/create-checkout-session`,
      data
    );
  }
  getHistory() {
    return this.http.get<PaymentHistory[]>(`${this.api}/trainer`);
  }
  getHistoryAdmin() {
    return this.http.get<PaymentHistory[]>(`${this.api}`);
  }
  getPurchasedPrograms(): Observable<PurchasedProgram[]> {
    return this.http.get<PurchasedProgram[]>(`${this.api}/purchased`);
  }
  getEntrolledUsers(programId: string): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(
      `${this.api}/entrolled/${programId}`
    );
  }
  getTopCategories(): Observable<ITopCategory[]> {
    return this.http.get<ITopCategory[]>(`${this.api}/top-categories`);
  }
}
