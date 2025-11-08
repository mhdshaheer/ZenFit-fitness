import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BookingRoutes } from '../constants/api-routes.const';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl + BookingRoutes.BASE;

  createBooking(slotId: string, day: string, date: Date) {
    return this._http.post(this._apiUrl, { slotId, day, date });
  }
}
