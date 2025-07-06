import { createReducer, on } from '@ngrx/store';
import * as UserActions from '../user/user.actions';
import { User } from '../../models/user.model';

export interface UserState {
  users: User[];
  loading: boolean;
  error: any;
}

export const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

export const userReducer = createReducer(
  initialState,

  on(UserActions.loadUsers, (state) => ({ ...state, loading: true })),
  on(UserActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
  })),
  on(UserActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),

  on(UserActions.createUserSuccess, (state, { user }) => ({
    ...state,
    users: [...state.users, user],
  })),
  on(UserActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    users: state.users.map((u) => (u._id === user._id ? user : u)),
  })),

  on(UserActions.blockUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.map((u) =>
      u._id === id ? { ...u, status: 'blocked' } : u
    ),
  })),
  on(UserActions.unblockUserSuccess, (s, { id }) => ({
    ...s,
    users: s.users.map((u) => (u._id === id ? { ...u, status: 'active' } : u)),
  }))
);
