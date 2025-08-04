import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  LoginPayload,
  SignupPayload,
} from '../../features/auth/store/auth.model';
import { environment } from '../../../environments/environment';
import { catchError, firstValueFrom, map, of, retry, take } from 'rxjs';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  signup(payload: SignupPayload) {
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${environment.apiUrl}/auth/signup`,
        payload,
        { withCredentials: true }
      )
      .pipe(take(1)); // unsubscribe
  }

  refreshToken() {
    return this.http
      .post<{ accessToken: string }>(
        `${environment.apiUrl}/auth/refresh-token`,
        {},
        { withCredentials: true }
      )
      .pipe(
        retry(1),
        map(() => {
          return true;
        }),
        catchError(() => {
          return of(false);
        }),
        take(1)
      );
  }

  verifyOtp(email: string, otp: string) {
    return this.http
      .post<{ accessToken: string; email: string; role: string }>(
        `${environment.apiUrl}/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      )
      .pipe(take(1));
  }

  resentOtp(email: string) {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/resent-otp`, {
        email,
      })
      .pipe(take(1));
  }

  login(payload: LoginPayload) {
    return this.http
      .post<{ accessToken: string; role: string }>(
        `${environment.apiUrl}/auth/login`,
        payload,
        { withCredentials: true }
      )
      .pipe(take(1));
  }

  logout() {
    return this.http
      .post<{ message: string }>(
        `${environment.apiUrl}/auth/logout`,
        {},
        { withCredentials: true }
      )
      .pipe(take(1));
  }

  sendOtp(email: string) {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/send-otp`, {
        email,
      })
      .pipe(take(1));
  }

  verifyForgotOtp(email: string, otp: string) {
    return this.http
      .post<{ message: string }>(
        `${environment.apiUrl}/auth/verify-forgot-otp`,
        {
          email,
          otp,
        }
      )
      .pipe(take(1));
  }

  resetPassword(email: string, newPassword: string) {
    return this.http
      .post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, {
        email,
        newPassword,
      })
      .pipe(take(1));
  }

  googleSignup(payload: { idToken: string; email: string; username: string }) {
    return this.http
      .post<{
        accessToken: string;
        refreshToken: string;
        role: string;
      }>(`${environment.apiUrl}/auth/google-signup`, payload)
      .pipe(take(1));
  }

  // ---------------- CLIENT HELPERS ----------------

  async isLoggedIn(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.get(`${environment.apiUrl}/auth/protected`, {
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
      return typeof payload.role === 'string' ? payload.role : null;
    } catch (error) {
      this.logger.error('Failed to decode token', error);
      return null;
    }
  }
}
