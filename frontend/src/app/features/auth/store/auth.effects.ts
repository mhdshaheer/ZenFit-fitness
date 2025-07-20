import { inject, Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../../core/services/auth.service';
import { OtpAccessService } from '../../../core/services/otp-access.service';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { LoginPayload } from './auth.model';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private otpService = inject(OtpAccessService);

  // Signup
  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.signup),
      mergeMap(({ payload }) =>
        this.authService.signup(payload).pipe(
          map((res) => {
            console.log('Response : ', res);
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
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'OTP sent successfully!',
            showConfirmButton: false,
            toast: true,
            timer: 1500,
          }).then(() => {
            sessionStorage.setItem('canAccessOtp', 'true');
            this.router.navigate(['/auth/otp']);
          });
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
            console.log('Login response : ', res);
            return AuthActions.loginSuccess({
              accessToken: res.accessToken,
              role: res.role,
            });
          }),
          catchError((err) => {
            console.log('on error login');
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
        tap(({ accessToken, role }) => {
          localStorage.setItem('accessToken', accessToken);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Login successfull!',
            showConfirmButton: false,
            toast: true,
            timer: 1500,
          }).then(() => {
            this.router.navigate([`/${role}/dashboard`]);
          });
        })
      ),
    { dispatch: false }
  );

  postLoginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(({ error }) => {
          Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: error || 'Invalid email or password',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false,
          });
        })
      ),
    { dispatch: false }
  );

  // Refresh access token
  refreshAccessToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshAccessToken),
      switchMap(() =>
        this.authService.refreshToken().pipe(
          map((res: { accessToken: string }) =>
            AuthActions.refreshAccessTokenSuccess({
              accessToken: res.accessToken,
            })
          ),
          catchError(() =>
            of(
              AuthActions.refreshAccessTokenFailure({
                error: 'Token refresh failed',
              })
            )
          )
        )
      )
    )
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
