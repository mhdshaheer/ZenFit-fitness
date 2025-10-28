import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IUserResponse } from '../../interface/user.interface';
import { ProfileRouter } from '../constants/api-routes.const';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly _apiUrl = environment.apiUrl;
  private readonly _http = inject(HttpClient);

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
      `${this._apiUrl}${ProfileRouter.FILE_BASE}${
        ProfileRouter.IMAGE
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
  getProfile(id = '') {
    return this._http.get<any>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PROFILE}?id=${id}`
    );
  }

  updateProfile(data: any) {
    return this._http.put<any>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PROFILE}`,
      data
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this._http.post<{ message: string }>(
      `${this._apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PASSWORD}`,
      data
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
