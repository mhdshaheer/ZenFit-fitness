import { createAction, props } from '@ngrx/store';
import { User } from '../../../shared/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

// export const loadUsers = createAction('[User] Load Users');
export const loadUsers = createAction(
  '[Admin] Load Users',
  props<{
    page: number;
    pageSize: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }>()
);
// ====================
export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ users: User[]; total: number }>()
);
export const loadUsersFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: HttpErrorResponse }>()
);

export const createUser = createAction(
  '[User] Create User',
  props<{ user: Partial<User> }>()
);
export const createUserSuccess = createAction(
  '[User] Create User Success',
  props<{ user: User }>()
);
export const createUserFailure = createAction(
  '[User] Create User Failure',
  props<{ error: HttpErrorResponse }>()
);

export const updateUser = createAction(
  '[User] Update User',
  props<{ user: User }>()
);
export const updateUserSuccess = createAction(
  '[User] Update User Success',
  props<{ user: User }>()
);
export const updateUserFailure = createAction(
  '[User] Update User Failure',
  props<{ error: HttpErrorResponse }>()
);

// update user status
export const updateUserStatus = createAction(
  '[User] Update User Status',
  props<{ id: string; status: 'active' | 'blocked' }>()
);

export const updateUserStatusSuccess = createAction(
  '[User] Update User Status Success',
  props<{ id: string; status: 'active' | 'blocked' }>()
);

export const updateUserStatusFailure = createAction(
  '[User] Update User Status Failure',
  props<{ error: HttpErrorResponse }>()
);
