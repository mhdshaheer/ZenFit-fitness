import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  SlotInstanceRoutes,
  SlotTemplateRoutes,
} from '../constants/api-routes.const';
import {
  ICreateSlotTemplatePayload,
  ISlotInstancePaginatedResponse,
  ISlotInstancePublic,
  ISlotTemplateResponse,
  IUpdateSlotTemplatePayload,
} from '../../interface/slot.interface';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private readonly _templateUrl = environment.apiUrl + SlotTemplateRoutes.Base;
  private readonly _instanceUrl = environment.apiUrl + SlotInstanceRoutes.Base;
  private readonly _http = inject(HttpClient);
  createTemplate(payload: ICreateSlotTemplatePayload): Observable<ISlotTemplateResponse> {
    return this._http.post<ISlotTemplateResponse>(this._templateUrl, payload, {
      withCredentials: true,
    });
  }

  deleteTemplate(templateId: string): Observable<ISlotTemplateResponse> {
    return this._http.delete<ISlotTemplateResponse>(
      `${this._templateUrl}/${templateId}`,
      { withCredentials: true }
    );
  }

  updateTemplate(
    templateId: string,
    payload: IUpdateSlotTemplatePayload
  ): Observable<ISlotTemplateResponse> {
    return this._http.patch<ISlotTemplateResponse>(
      `${this._templateUrl}/${templateId}`,
      payload,
      { withCredentials: true }
    );
  }

  getTemplates(): Observable<ISlotTemplateResponse[]> {
    return this._http.get<ISlotTemplateResponse[]>(this._templateUrl, {
      withCredentials: true,
    });
  }

  generateInstancesForTemplate(
    templateId: string,
    daysAhead: number
  ): Observable<{ success: boolean }> {
    return this._http.post<{ success: boolean }>(
      `${this._instanceUrl}/generate/${templateId}`,
      { daysAhead },
      { withCredentials: true }
    );
  }

  getTrainerInstances(params: {
    segment: 'upcoming' | 'past';
    from?: string;
    to?: string;
    status?: 'OPEN' | 'CLOSED' | 'CANCELLED';
    search?: string;
    page?: number;
    limit?: number;
    programIds?: string[];
  }): Observable<ISlotInstancePaginatedResponse> {
    let httpParams = new HttpParams().set('segment', params.segment);
    if (params.from) {
      httpParams = httpParams.set('from', params.from);
    }
    if (params.to) {
      httpParams = httpParams.set('to', params.to);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.page) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit);
    }
    if (params.programIds?.length) {
      httpParams = httpParams.set('programIds', params.programIds.join(','));
    }
    return this._http.get<ISlotInstancePaginatedResponse>(this._instanceUrl, {
      params: httpParams,
      withCredentials: true,
    });
  }

  getSlotInstancesForProgram(
    programId: string,
    from?: string,
    to?: string,
    limit?: number,
    page?: number
  ): Observable<ISlotInstancePaginatedResponse> {
    let params = new HttpParams().set('programId', programId);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    if (limit) params = params.set('limit', limit);
    if (page) params = params.set('page', page);
    return this._http.get<ISlotInstancePaginatedResponse>(
      `${environment.apiUrl}${SlotInstanceRoutes.PublicProgram}`,
      { params }
    );
  }

  cancelSlotInstance(instanceId: string): Observable<ISlotInstancePublic> {
    return this._http.patch<ISlotInstancePublic>(
      `${this._instanceUrl}/${instanceId}/cancel`,
      {},
      { withCredentials: true }
    );
  }
}
