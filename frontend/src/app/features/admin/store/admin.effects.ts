import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AdminService } from '../../../core/services/admin.service';
import * as AdminActions from '../store/admin.actions';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';

@Injectable()
export class AdminEffects {
  private actions$ = inject(Actions);
  private adminService = inject(AdminService);

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadUsers),
      switchMap(({ page, pageSize, search, sortBy, sortOrder }) =>
        this.adminService
          .getUsers({ page, pageSize, search, sortBy, sortOrder })
          .pipe(
            map((response) => {
              console.log('data response from backend: ', response);
              return AdminActions.loadUsersSuccess({
                users: response.data,
                total: response.total,
              });
            }),
            catchError((error) => of(AdminActions.loadUsersFailure({ error })))
          )
      )
    )
  );

  // update user status
  updateUserStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateUserStatus),
      mergeMap(({ id, status }) =>
        this.adminService.updateUserStatus(id, status).pipe(
          map(() => AdminActions.updateUserStatusSuccess({ id, status })),
          catchError((error) =>
            of(AdminActions.updateUserStatusFailure({ error }))
          )
        )
      )
    )
  );
}
