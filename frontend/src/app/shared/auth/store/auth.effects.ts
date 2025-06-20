import { inject, Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { login, loginSuccess, loginFailure } from './auth.actions';
import { AuthResponse } from './models/auth.model';

@Injectable()
export class AuthEffects {
  private http = inject(HttpClient);
  private action$ = inject(Actions);

  login$ = createEffect(() =>
    this.action$.pipe(
      ofType(login),
      mergeMap(({ email, password }) =>
        this.http.post<AuthResponse>('api/login', { email, password }).pipe(
          map((response) =>
            loginSuccess({ token: response.token, role: response.role })
          ),
          catchError((error) =>
            of(loginFailure({ error: error.error.message || 'Login failed' }))
          )
        )
      )
    )
  );
}
