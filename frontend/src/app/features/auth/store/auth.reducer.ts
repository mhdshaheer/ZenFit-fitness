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
  on(AuthActions.signup, AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.signupSuccess, AuthActions.loginSuccess, (state) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(
    AuthActions.signupFailure,
    AuthActions.loginFailure,
    (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })
  ),
  on(AuthActions.refreshAccessTokenSuccess, (state, { accessToken }) => ({
    ...state,
    accessToken,
  })),
  on(AuthActions.refreshAccessTokenFailure, (state, { error }) => ({
    ...state,
    error,
    accessToken: null,
  })),

  // google
  on(AuthActions.googleSignup, (state) => ({
    ...state,
    signupLoading: true,
    error: null,
  })),

  on(
    AuthActions.googleSignupSuccess,
    (state, { accessToken, refreshToken, role }) => ({
      ...state,
      signupLoading: false,
      accessToken,
      refreshToken,
      user: { role },
    })
  ),

  on(AuthActions.googleSignupFailure, (state, { error }) => ({
    ...state,
    signupLoading: false,
    error,
  }))
);
