import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IPaymentCourse } from '../../interface/payment.interface';

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
}
