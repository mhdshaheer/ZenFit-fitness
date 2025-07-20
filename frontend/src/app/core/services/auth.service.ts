import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  LoginPayload,
  SignupPayload,
} from '../../features/auth/store/auth.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  signup(payload: SignupPayload) {
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

  login(payload: LoginPayload) {
    return this.http.post<{ accessToken: string; role: string }>(
      `${environment.apiUrl}/auth/login`,
      payload,
      { withCredentials: true }
    );
  }

  sendOtp(email: string) {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/send-otp`,
      {
        email,
      }
    );
  }

  verifyForgotOtp(email: string, otp: string) {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/verify-forgot-otp`,
      {
        email,
        otp,
      }
    );
  }

  resetPassword(email: string, newPassword: string) {
    return this.http.post<{ message: string }>(
      `${environment.apiUrl}/auth/reset-password`,
      {
        email,
        newPassword,
      }
    );
  }

  googleSignup(payload: { idToken: string; email: string; username: string }) {
    return this.http.post<{
      accessToken: string;
      refreshToken: string;
      role: string;
    }>(`${environment.apiUrl}/auth/google-signup`, payload);
  }

  // ---------------- CLIENT HELPERS ----------------

  // isLoggedIn(): boolean {
  //   return !!localStorage.getItem('accessToken');
  // }
  async isLoggedIn(): Promise<boolean> {
    try {
      const res = await firstValueFrom(
        this.http.get('http://localhost:5001/auth/protected', {
          withCredentials: true,
        })
      );
      return true;
    } catch {
      return false;
    }
  }
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }
  getUserRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    this.router.navigate(['/auth/login']);
  }
}
