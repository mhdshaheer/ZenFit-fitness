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
  private readonly _apiUrl = environment.apiUrl + SessionRoutes.BASE;
  private readonly _http = inject(HttpClient);

  saveSessionDraft(sessionData: SlotFormData) {
    return this._http.post<{ message: string }>(
      `${this._apiUrl}${SessionRoutes.DRAFT}`,
      sessionData
    );
  }
  saveSession(sessionData: SlotFormData) {
    return this._http.post<{ message: string }>(`${this._apiUrl}`, sessionData);
  }
  getSession(programId: string) {
    return this._http.get<IProgramSlot>(`${this._apiUrl}/${programId}`);
  }
}
