import { createReducer, on } from '@ngrx/store';
import { AuthState } from './auth.model';
import * as AuthActions from './auth.actions';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.signup, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.signupSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(AuthActions.signupFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.refreshAccessTokenSuccess, (state, { accessToken }) => ({
    ...state,
    accessToken,
  })),
  on(AuthActions.refreshAccessTokenFailure, (state, { error }) => ({
    ...state,
    error,
    accessToken: null,
  }))
);
