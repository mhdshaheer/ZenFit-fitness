import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  updateUserStatus(id: string, status: 'active' | 'blocked') {
    return this.http.patch(`${this.apiUrl}/admin/users/${id}/status`, {
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

    return this.http.get<{ data: User[]; total: number }>(
      `${this.apiUrl}/admin/users`,
      {
        params: httpParams,
        withCredentials: true,
      }
    );
  }
}
