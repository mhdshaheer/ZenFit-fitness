import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ILoggedUser, IUserResponse } from '../../interface/user.interface';
import { ProfileRouter } from '../constants/api-routes.const';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly _apiUrl = environment.apiUrl;
  private readonly _http = inject(HttpClient);
  private _profileCache$?: Observable<IUserResponse>;

  uploadfile(
    file: File,
    type: 'profile' | 'resume'
  ): Observable<HttpEvent<{ key: string; url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const req = new HttpRequest(
      'POST',
      `${this._apiUrl}${ProfileRouter.FILE_BASE}${ProfileRouter.UPLOAD}`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );

    return this._http.request<{ key: string; url: string }>(req);
  }
  getFile(key: string, id = '') {
    return this._http.get<{ url: string }>(
      `${this._apiUrl}${ProfileRouter.FILE_BASE}${ProfileRouter.IMAGE
      }?key=${encodeURIComponent(key)}&id=${id}`
    );
  }
  deleteFile(key: string) {
    return this._http.delete<{ message: string }>(
      `${this._apiUrl}${ProfileRouter.FILE_BASE}/${key}`
    );
  }

  deleteS3File(key: string, type: string) {
    return this._http.delete<{ message: string }>(
      `${this._apiUrl}${ProfileRouter.FILE_BASE}/${type}/${encodeURIComponent(
        key
      )}`
    );
  }
  // Personal information
  getUserById(userId: string): Observable<IUserResponse> {
    return this._http.get<IUserResponse>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}/${userId}`
    );
  }

  clearCache() {
    this._profileCache$ = undefined;
  }

  getProfile(id = '', force = false): Observable<IUserResponse> {
    if (id === '' && this._profileCache$ && !force) {
      return this._profileCache$;
    }

    const request$ = this._http.get<IUserResponse>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PROFILE}?id=${id}`
    ).pipe(
      shareReplay(1)
    );

    if (id === '') {
      this._profileCache$ = request$;
    }

    return request$;
  }

  updateProfile(data: Partial<IUserResponse>): Observable<IUserResponse> {
    return this._http.put<IUserResponse>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PROFILE}`,
      data
    ).pipe(
      tap(() => this.clearCache())
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this._http.post<{ message: string }>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PASSWORD}`,
      data
    );
  }

  getCurrentUserId(): Observable<ILoggedUser> {
    return this._http.get<ILoggedUser>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}/current`
    );
  }

  // Admin side Profie
  verifyResume(id: string) {
    return this._http.put<{ isVerified: boolean }>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.VERIFY_RESUME}`,
      { id }
    );
  }
}
