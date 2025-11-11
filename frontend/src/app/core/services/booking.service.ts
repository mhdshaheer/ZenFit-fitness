import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BookingRoutes } from '../constants/api-routes.const';
import { Observable } from 'rxjs';

export interface BookedSlot {
  _id: string;
  slotId: string;
  userId: string;
  programId: string;
  day: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl + BookingRoutes.BASE;

  createBooking(slotId: string, day: string, date: Date) {
    return this._http.post(this._apiUrl, { slotId, day, date });
  }

  getMyBookings(programId?: string): Observable<BookedSlot[]> {
    const url = programId 
      ? `${this._apiUrl}/my-bookings?programId=${programId}`
      : `${this._apiUrl}/my-bookings`;
    return this._http.get<BookedSlot[]>(url);
  }
}
