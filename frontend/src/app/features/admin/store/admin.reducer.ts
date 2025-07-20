import { createReducer, on } from '@ngrx/store';
import * as AdminActions from '../store/admin.actions';
import { User } from '../../../shared/models/user.model';

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

export const adminReducer = createReducer(
  initialState,

  on(AdminActions.loadUsers, (state) => ({ ...state, loading: true })),
  on(AdminActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
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

  on(AdminActions.blockUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users.map((u) =>
      u._id === id ? { ...u, status: 'blocked' } : u
    ),
  })),
  on(AdminActions.unblockUserSuccess, (s, { id }) => ({
    ...s,
    users: s.users.map((u) => (u._id === id ? { ...u, status: 'active' } : u)),
  }))
);
