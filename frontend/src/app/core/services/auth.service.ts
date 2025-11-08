import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  LoginPayload,
  SignupPayload,
} from '../../features/auth/store/auth.model';
import { environment } from '../../../environments/environment';
import {
  catchError,
  firstValueFrom,
  map,
  Observable,
  of,
  retry,
  take,
} from 'rxjs';
import { LoggerService } from './logger.service';
import { AuthRoutes } from '../constants/api-routes.const';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _logger = inject(LoggerService);
  private readonly _api = environment.apiUrl + AuthRoutes.BASE;

  signup(payload: SignupPayload) {
    return this._http
      .post<{ accessToken: string; refreshToken: string }>(
        this._api + AuthRoutes.SIGNUP,
        payload,
        { withCredentials: true }
      )
      .pipe(take(1));
  }

  refreshToken() {
    return this._http
      .post<{ accessToken: string }>(
        this._api + AuthRoutes.REFRESH_TOKEN,
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
    return this._http
      .post<{ accessToken: string; email: string; role: string }>(
        this._api + AuthRoutes.VERIFY_OTP,
        { email, otp },
        { withCredentials: true }
      )
      .pipe(take(1));
  }

  resentOtp(email: string) {
    return this._http
      .post<{ message: string }>(this._api + AuthRoutes.RESENT_OTP, {
        email,
      })
      .pipe(take(1));
  }

  login(payload: LoginPayload) {
    return this._http
      .post<{ accessToken: string; role: string }>(
        this._api + AuthRoutes.LOGIN,
        payload,
        { withCredentials: true }
      )
      .pipe(take(1));
  }

  logout() {
    return this._http
      .post<{ message: string }>(
        this._api + AuthRoutes.LOGOUT,
        {},
        { withCredentials: true }
      )
      .pipe(take(1));
  }

  sendOtp(email: string) {
    return this._http
      .post<{ message: string }>(this._api + AuthRoutes.SEND_OTP, {
        email,
      })
      .pipe(take(1));
  }

  verifyForgotOtp(email: string, otp: string) {
    return this._http
      .post<{ message: string }>(this._api + AuthRoutes.VERIFY_FORGOT_OTP, {
        email,
        otp,
      })
      .pipe(take(1));
  }

  resetPassword(email: string, newPassword: string) {
    return this._http
      .post<{ message: string }>(this._api + AuthRoutes.RESET_PASSWORD, {
        email,
        newPassword,
      })
      .pipe(take(1));
  }

  googleSignup(payload: { idToken: string; email: string; username: string }) {
    return this._http
      .post<{
        accessToken: string;
        refreshToken: string;
        role: string;
      }>(this._api + AuthRoutes.GOOGLE_SIGNUP, payload)
      .pipe(take(1));
  }

  // ---------------- CLIENT HELPERS ----------------

  async isLoggedIn(): Promise<boolean> {
    try {
      await firstValueFrom(
        this._http.get(this._api + AuthRoutes.PROTECTED, {
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
      this._logger.error('Failed to decode token', error);
      return null;
    }
  }
  getUserId(): Observable<{ userId: string }> {
    return this._http.get<{ userId: string }>(this._api);
  }
}
