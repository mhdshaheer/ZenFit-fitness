import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignupPayload } from '../../features/auth/store/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  signup(payload: SignupPayload) {
    console.log('signup service:  ', payload);
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${environment.apiUrl}/auth/signup`,
      payload,
      { withCredentials: true } // Optional, if backend sets refresh cookie here
    );
  }

  refreshToken() {
    return this.http.post<{ accessToken: string }>(
      `${environment.apiUrl}/auth/refresh-token`,
      {},
      { withCredentials: true }
    );
  }

  verifyOtp(email: string, otp: string) {
    return this.http.post<{ accessToken: string; email: string; role: string }>(
      `${environment.apiUrl}/auth/verify-otp`,
      { email, otp },
      { withCredentials: true } // To receive refreshToken in cookie
    );
  }

  resentOtp(email: string) {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/resent-otp`,
      { email }
    );
  }
}
