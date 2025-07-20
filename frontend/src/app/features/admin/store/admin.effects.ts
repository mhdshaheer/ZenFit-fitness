import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AdminService } from '../../../core/services/admin.service';
import * as AdminActions from '../store/admin.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private adminService = inject(AdminService);
  constructor() {}

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.loadUsers),
      mergeMap(() =>
        this.adminService.getUsers().pipe(
          map((users) => AdminActions.loadUsersSuccess({ users })),
          catchError((error) => of(AdminActions.loadUsersFailure({ error })))
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.createUser),
      mergeMap(({ user }) =>
        this.adminService.createUser(user).pipe(
          map((newUser) => AdminActions.createUserSuccess({ user: newUser })),
          catchError((error) => of(AdminActions.createUserFailure({ error })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.updateUser),
      mergeMap(({ user }) =>
        this.adminService.updateUser(user).pipe(
          map((updatedUser) =>
            AdminActions.updateUserSuccess({ user: updatedUser })
          ),
          catchError((error) => of(AdminActions.updateUserFailure({ error })))
        )
      )
    )
  );

  blockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.blockUser),
      mergeMap(({ id }) =>
        this.adminService.blockUser(id).pipe(
          map(() => AdminActions.blockUserSuccess({ id })),
          catchError((error) => of(AdminActions.blockUserFailure({ error })))
        )
      )
    )
  );

  unblockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AdminActions.unblockUser),
      mergeMap(({ id }) =>
        this.adminService.unblockUser(id).pipe(
          map(() => AdminActions.unblockUserSuccess({ id })),
          catchError((error) => of(AdminActions.unblockUserFailure({ error })))
        )
      )
    )
  );
}
