import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);
export const selectRole = createSelector(
  selectAuthState,
  (state) => state.role
);
export const selectLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);
export const selectError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectAuthStatus = createSelector(selectAuthState, (state) => ({
  token: state.token,
  role: state.role,
}));
