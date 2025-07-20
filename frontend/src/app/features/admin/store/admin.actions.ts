import { createAction, props } from '@ngrx/store';
import { User } from '../../../shared/models/user.model';

export const loadUsers = createAction('[User] Load Users');
export const loadUsersSuccess = createAction(
  '[User] Load Users Success',
  props<{ users: User[] }>()
);
export const loadUsersFailure = createAction(
  '[User] Load Users Failure',
  props<{ error: any }>()
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
  props<{ error: any }>()
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
  props<{ error: any }>()
);

export const blockUser = createAction(
  '[User] Block User',
  props<{ id: string }>()
);
export const blockUserSuccess = createAction(
  '[User] Block User Success',
  props<{ id: string }>()
);
export const blockUserFailure = createAction(
  '[User] Block User Failure',
  props<{ error: any }>()
);

export const unblockUser = createAction(
  '[User] Unblock User',
  props<{ id: string }>()
);
export const unblockUserSuccess = createAction(
  '[User] Unblock User Success',
  props<{ id: string }>()
);
export const unblockUserFailure = createAction(
  '[User] Unblock User Failure',
  props<{ error: any }>()
);
