import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { SlotRoutes } from '../constants/api-routes.const';
import { HttpClient } from '@angular/common/http';
import { ISlotInput, ISlotOutput, ISlotStatus } from '../../interface/slot.interface';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private readonly _apiUrl = environment.apiUrl + SlotRoutes.Base;
  private readonly _http = inject(HttpClient);
  createSlot(slotData: Partial<ISlotInput>): Observable<ISlotOutput> {
    return this._http.post<ISlotOutput>(this._apiUrl, slotData);
  }
  getSlotByTrainer(): Observable<ISlotOutput[]> {
    return this._http.get<ISlotOutput[]>(`${this._apiUrl}`);
  }
  updateSlotById(
    slotId: string,
    slotData: Partial<ISlotInput>
  ): Observable<ISlotOutput> {
    return this._http.put<ISlotOutput>(`${this._apiUrl}/${slotId}`, slotData);
  }
  updateSlotStatus(
    slotId: string,
    slotStatus: ISlotStatus
  ): Observable<ISlotOutput> {
    return this._http.put<ISlotOutput>(
      `${this._apiUrl}/status/${slotId}`,
      {status:slotStatus}
    );
  }
}
