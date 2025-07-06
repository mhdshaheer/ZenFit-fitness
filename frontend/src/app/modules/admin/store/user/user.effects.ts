import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { UserService } from '../user/user.service';
import * as UserActions from '../user/user.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);
  constructor() {}

  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUsers),
      mergeMap(() =>
        this.userService.getUsers().pipe(
          map((users) => UserActions.loadUsersSuccess({ users })),
          catchError((error) => of(UserActions.loadUsersFailure({ error })))
        )
      )
    )
  );

  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.createUser),
      mergeMap(({ user }) =>
        this.userService.createUser(user).pipe(
          map((newUser) => UserActions.createUserSuccess({ user: newUser })),
          catchError((error) => of(UserActions.createUserFailure({ error })))
        )
      )
    )
  );

  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUser),
      mergeMap(({ user }) =>
        this.userService.updateUser(user).pipe(
          map((updatedUser) =>
            UserActions.updateUserSuccess({ user: updatedUser })
          ),
          catchError((error) => of(UserActions.updateUserFailure({ error })))
        )
      )
    )
  );

  blockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.blockUser),
      mergeMap(({ id }) =>
        this.userService.blockUser(id).pipe(
          map(() => UserActions.blockUserSuccess({ id })),
          catchError((error) => of(UserActions.blockUserFailure({ error })))
        )
      )
    )
  );

  unblockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.unblockUser),
      mergeMap(({ id }) =>
        this.userService.unblockUser(id).pipe(
          map(() => UserActions.unblockUserSuccess({ id })),
          catchError((error) => of(UserActions.unblockUserFailure({ error })))
        )
      )
    )
  );
}
