import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  login(email: string, password: string, role: string) {
    return this.http.post<{
      token: string;
      role: 'admin' | 'user' | 'trainer';
    }>(`${this.api}/${role}/login`, { email, password, role });
  }
}
