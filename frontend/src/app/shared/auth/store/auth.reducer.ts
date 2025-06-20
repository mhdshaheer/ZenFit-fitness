import { createReducer, on } from '@ngrx/store';
import { login, loginSuccess, loginFailure } from './auth.actions';

export interface AuthState {
  token: string | null;
  role: 'admin' | 'user' | 'trainer' | null;
  error: string | null;
  loading: boolean;
}

export const initialState: AuthState = {
  token: null,
  role: null,
  error: null,
  loading: false,
};

export const authReducer = createReducer(
  initialState,
  on(login, (state) => ({ ...state, loading: true, error: null })),
  on(loginSuccess, (state, { token, role }) => ({
    ...state,
    token,
    role,
    loading: false,
    error: null,
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
    token: null,
    role: null,
  }))
);
