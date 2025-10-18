import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  IProgramSlot,
  SlotFormData,
} from '../../features/trainer/store/trainer.model';
import { SessionRoutes } from '../constants/api-routes.const';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = environment.apiUrl + SessionRoutes.BASE;
  private http = inject(HttpClient);

  saveSessionDraft(sessionData: SlotFormData) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}${SessionRoutes.DRAFT}`,
      sessionData
    );
  }
  saveSession(sessionData: SlotFormData) {
    return this.http.post<{ message: string }>(`${this.apiUrl}`, sessionData);
  }
  getSession(programId: string) {
    return this.http.get<IProgramSlot>(`${this.apiUrl}/${programId}`);
  }
}
