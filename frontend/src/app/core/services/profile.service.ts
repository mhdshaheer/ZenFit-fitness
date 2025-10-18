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
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  uploadfile(
    file: File,
    type: 'profile' | 'resume'
  ): Observable<HttpEvent<{ key: string; url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const req = new HttpRequest(
      'POST',
      `${this.apiUrl}${ProfileRouter.FILE_BASE}${ProfileRouter.UPLOAD}`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      }
    );

    return this.http.request<{ key: string; url: string }>(req);
  }
  getFile(key: string, id = '') {
    return this.http.get<{ url: string }>(
      `${this.apiUrl}${ProfileRouter.FILE_BASE}${
        ProfileRouter.IMAGE
      }?key=${encodeURIComponent(key)}&id=${id}`
    );
  }
  deleteFile(key: string) {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}${ProfileRouter.FILE_BASE}/${key}`
    );
  }

  deleteS3File(key: string, type: string) {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}${ProfileRouter.FILE_BASE}/${type}/${encodeURIComponent(
        key
      )}`
    );
  }
  // Personal information
  getUserById(userId: string): Observable<IUserResponse> {
    return this.http.get<IUserResponse>(
      `${this.apiUrl}${ProfileRouter.USER_BASE}/${userId}`
    );
  }
  getProfile(id = '') {
    return this.http.get<any>(
      `${this.apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PROFILE}?id=${id}`
    );
  }

  updateProfile(data: any) {
    return this.http.put<any>(
      `${this.apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PROFILE}`,
      data
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.PASSWORD}`,
      data
    );
  }

  // Admin side Profie
  verifyResume(id: string) {
    return this.http.put<{ isVerified: boolean }>(
      `${this.apiUrl}${ProfileRouter.USER_BASE}${ProfileRouter.VERIFY_RESUME}`,
      { id }
    );
  }
}
