import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FeedbackData {
  _id: string;
  slotId: string;
  trainerId: string;
  sessionDate: Date;
  feedback: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeedbackRequest {
  slotId: string;
  sessionDate: Date | string;
  feedback: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl + '/feedback';

  createOrUpdateFeedback(data: CreateFeedbackRequest): Observable<{ message: string; feedback: FeedbackData }> {
    return this._http.post<{ message: string; feedback: FeedbackData }>(this._apiUrl, data);
  }

  getFeedbackBySlotAndDate(slotId: string, sessionDate: Date | string): Observable<FeedbackData | null> {
    // Ensure sessionDate is a Date object and send only the date part (YYYY-MM-DD)
    const date = sessionDate instanceof Date ? sessionDate : new Date(sessionDate);
    const dateOnly = date.toISOString().split('T')[0];
    const params = {
      slotId,
      sessionDate: dateOnly
    };
    return this._http.get<FeedbackData | null>(this._apiUrl, { params });
  }

  getFeedbacksBySlotId(slotId: string): Observable<FeedbackData[]> {
    return this._http.get<FeedbackData[]>(`${this._apiUrl}/${slotId}`);
  }

  deleteFeedback(slotId: string, sessionDate: Date | string): Observable<{ message: string }> {
    // Ensure sessionDate is a Date object and send only the date part (YYYY-MM-DD)
    const date = sessionDate instanceof Date ? sessionDate : new Date(sessionDate);
    const dateOnly = date.toISOString().split('T')[0];
    const body = {
      slotId,
      sessionDate: dateOnly
    };
    return this._http.delete<{ message: string }>(this._apiUrl, { body });
  }
}
