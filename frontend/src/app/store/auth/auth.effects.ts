import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from './auth.service';
import * as AuthActions from './auth.actions';
import { catchError, map, mergeMap, of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ email, password, role }) =>
        this.authService.login(email, password, role).pipe(
          map((res) => {
            console.log('login success...', res);
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Login success',
              showConfirmButton: false,
              timer: 1500,
            });
            return AuthActions.loginSuccess({
              token: res.token,
              role: res.role,
            });
          }),
          catchError((err) =>
            of(
              AuthActions.loginFailure({
                error: err.error.message || 'Login failed',
              })
            )
          )
        )
      )
    )
  );
}
