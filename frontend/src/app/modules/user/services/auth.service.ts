import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUri = 'http://localhost:5001/user';
  constructor(private http: HttpClient) {}
  sendOtp(user: any): Observable<any> {
    return this.http.post(`${this.apiUri}/send-otp`, user);
  }

  verifyOtp(data: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.apiUri}/verify-otp`, data);
  }
}
