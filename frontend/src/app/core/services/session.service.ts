import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  IProgramSlot,
  SlotFormData,
} from '../../features/trainer/store/trainer.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  saveSessionDraft(sessionData: SlotFormData) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/session/draft`,
      sessionData
    );
  }
  saveSession(sessionData: SlotFormData) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/session`,
      sessionData
    );
  }
  getSession(programId: string) {
    return this.http.get<IProgramSlot>(`${this.apiUrl}/session/${programId}`);
  }
}
