import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  token: string | null;
  role: 'admin' | 'user' | 'trainer' | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  role: null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { token, role }) => ({
    ...state,
    token,
    role,
    loading: false,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
