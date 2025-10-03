import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
      `${this.apiUrl}/file/profile/upload`,
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
      `${this.apiUrl}/file/profile/image?key=${encodeURIComponent(
        key
      )}&id=${id}`
    );
  }
  deleteFile(key: string) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/file/${key}`);
  }

  // Personal information
  getProfile(id = '') {
    return this.http.get<any>(`${this.apiUrl}/user/profile?id=${id}`);
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.apiUrl}/user/profile`, data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/user/password`,
      data
    );
  }

  deleteS3File(key: string, type: string) {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/file/${type}/${encodeURIComponent(key)}`
    );
  }
  // Admin side Profie
  verifyResume(id: string) {
    return this.http.put<{ isVerified: boolean }>(
      `${this.apiUrl}/user/resume`,
      { id }
    );
  }
}
