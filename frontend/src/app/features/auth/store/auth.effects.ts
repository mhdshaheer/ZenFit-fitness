import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../../core/services/auth.service';
import { OtpAccessService } from '../../../core/services/otp-access.service';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import Swal from 'sweetalert2';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private otpService = inject(OtpAccessService);
  private toastService = inject(ToastService);

  // Signup
  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signup),
      mergeMap(({ payload }) =>
        this.authService.signup(payload).pipe(
          map(() => {
            return AuthActions.signupSuccess({
              email: payload.email,
            });
          }),
          catchError((err) => {
            console.error('Error in signup effect ', err);
            return of(
              AuthActions.signupFailure({
                error: err.error.message || 'Signup failed',
              })
            );
          })
        )
      )
    )
  );

  postSignupSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.signupSuccess),
        tap(({ email }) => {
          localStorage.setItem('signupEmail', email);
          this.otpService.allowAccess();
          this.toastService.success('OTP sent successfully!', 'Check your email for the verification code.');
          sessionStorage.setItem('canAccessOtp', 'true');
          this.router.navigate(['/auth/otp']);
        })
      ),
    { dispatch: false }
  );

  // Login

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ payload }) =>
        this.authService.login(payload).pipe(
          map((res) => {
            return AuthActions.loginSuccess({
              accessToken: res.accessToken,
              role: res.role,
            });
          }),
          catchError((err) => {
            return of(
              AuthActions.loginFailure({
                error: err.error.message || 'Login Failed',
              })
            );
          })
        )
      )
    )
  );

  postLoginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ role }) => {
          // Token is already set as httpOnly cookie by backend
          // Clean up any old localStorage tokens and store minimal info for client-side role checking
          localStorage.removeItem('accessToken'); // Remove old token if exists
          localStorage.setItem('userRole', role);
          this.toastService.success('Login Successful', 'Welcome back to ZenFit Command Hub.');
          this.router.navigate([`/${role}/dashboard`]);
        })
      ),
    { dispatch: false }
  );

  postLoginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          this.toastService.error('Login Failed', error || 'Invalid email or password');
        })
      ),
    { dispatch: false }
  );

  // google signup
  googleSignup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.googleSignup),
      switchMap(({ payload }) =>
        this.authService.googleSignup(payload).pipe(
          map((res) =>
            AuthActions.googleSignupSuccess({
              accessToken: res.accessToken,
              refreshToken: res.refreshToken,
              role: res.role,
            })
          ),
          catchError((err) =>
            of(
              AuthActions.googleSignupFailure({
                error: err.error.message || 'Signup failed',
              })
            )
          )
        )
      )
    )
  );
}
