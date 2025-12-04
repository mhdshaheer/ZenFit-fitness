import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminRoutes } from '../constants/api-routes.const';
import {
  AdminDashboardResponse,
  AdminRangeFilter,
  AdminReportScope,
} from '../../interface/admin-dashboard.interface';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly _apiUrl = environment.apiUrl + AdminRoutes.BASE;
  private readonly _http = inject(HttpClient);

  updateUserStatus(id: string, status: 'active' | 'blocked') {
    return this._http.patch(this._apiUrl + AdminRoutes.USER_STATUS(id), {
      status,
    });
  }
  getUsers(params: {
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Observable<{ data: User[]; total: number }> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString())
      .set('sortBy', params.sortBy || 'createdAt')
      .set('sortOrder', params.sortOrder || 'asc');

    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this._http.get<{ data: User[]; total: number }>(
      this._apiUrl + AdminRoutes.USERS,
      {
        params: httpParams,
        withCredentials: true,
      }
    );
  }

  getDashboardSnapshot(filters?: {
    scope?: AdminReportScope;
    range?: AdminRangeFilter;
  }): Observable<AdminDashboardResponse> {
    let params = new HttpParams();

    if (filters?.scope) {
      params = params.set('scope', filters.scope);
    }

    if (filters?.range) {
      params = params.set('range', filters.range);
    }

    return this._http.get<AdminDashboardResponse>(
      this._apiUrl + AdminRoutes.DASHBOARD,
      {
        params,
        withCredentials: true,
      }
    );
  }
}
