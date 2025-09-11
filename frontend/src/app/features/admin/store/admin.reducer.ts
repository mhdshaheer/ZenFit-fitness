import { createReducer, on } from '@ngrx/store';
import * as AdminActions from '../store/admin.actions';
import { User } from '../../../shared/models/user.model';

export interface UserState {
  users: User[];
  loading: boolean;
  total: number;
  error: unknown;
}

export const initialState: UserState = {
  users: [],
  loading: false,
  total: 0,
  error: null,
};

export const adminReducer = createReducer(
  initialState,

  on(AdminActions.loadUsers, (state) => ({ ...state, loading: true })),
  on(AdminActions.loadUsersSuccess, (state, { users, total }) => ({
    ...state,
    users,
    total,
    loading: false,
  })),
  on(AdminActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(AdminActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user],
  })),
  on(AdminActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    users: state.users.map((u) => (u._id === user._id ? user : u)),
  })),

  //Update user status
  on(AdminActions.updateUserStatusSuccess, (state, { id, status }) => ({
    ...state,
    users: state.users.map((user) =>
      user._id === id || user.id === id ? { ...user, status } : user
    ),
  }))
);
