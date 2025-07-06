import { inject, Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { AuthService } from '../../../core/services/auth.service';
import { OtpAccessService } from '../../../core/services/otp-access.service';
import { Router } from '@angular/router';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);
  private otpService = inject(OtpAccessService);

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
            timer: 1500,
          }).then(() => {
            this.router.navigate(['/auth/otp']);
          });
        })
      ),
    { dispatch: false }
  );

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
}
