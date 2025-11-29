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
  feedback?: string;
}

export interface Student {
  name: string;
  email: string;
  bookingId: string;
  status: string;
}

export interface TrainerSession {
  slotId: string;
  day: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  programName: string;
  duration: number;
  difficultyLevel: string;
  bookedCount: number;
  students: Student[];
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

  getTrainerSessions(): Observable<TrainerSession[]> {
    const url = `${this._apiUrl}/trainer-bookings`;
    return this._http.get<TrainerSession[]>(url);
  }
}
