import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = 'http://localhost:5001';
  constructor(private http: HttpClient) {}

  login(email: string, password: string, role: string) {
    return this.http.post<{
      token: string;
      role: 'admin' | 'user' | 'trainer';
    }>(`${this.api}/${role}/login`, { email, password, role });
  }
}
