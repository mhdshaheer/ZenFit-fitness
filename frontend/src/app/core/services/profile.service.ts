import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  uploadProfileImage(
    file: File,
    role: string,
    type: string,
    id: string
  ): Observable<{ key: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('role', role);
    formData.append('type', type);
    formData.append('id', id);

    return this.http.post<{ key: string }>(
      `${this.apiUrl}/file/profile/upload`,
      formData
    );
  }
  getFile(key: string) {
    return this.http.get<{ url: string }>(`${this.apiUrl}/file/${key}`);
  }
  deleteFile(key: string) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/file/${key}`);
  }

  // Personal information
  getProfile() {
    return this.http.get<any>(`${this.apiUrl}/user/profile`);
  }

  updateProfile(data: any) {
    return this.http.put<any>(`${this.apiUrl}/user/profile`, data);
  }
}
