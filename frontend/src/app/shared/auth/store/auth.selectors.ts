// import { createFeatureSelector, createSelector } from '@ngrx/store';
// import { AuthState } from './auth.reducer';

// export const selectAuthState = createFeatureSelector<AuthState>('auth');

// export const selectToken = createSelector(
//   selectAuthState,
//   (state) => state.token
// );

// export const selectRole = createSelector(
//   selectAuthState,
//   (state) => state.role
// );

// export const selectError = createSelector(
//   selectAuthState,
//   (state) => state.error
// );

// export const selectLoading = createSelector(
//   selectAuthState,
//   (state) => state.loading
// );

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);

export const selectRole = createSelector(
  selectAuthState,
  (state) => state.role
);

export const selectError = createSelector(
  selectAuthState,
  (state) => state.error
);

export const selectLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);

export const selectAuthStatus = createSelector(
  selectToken,
  selectRole,
  (token, role) => ({ token, role })
);
