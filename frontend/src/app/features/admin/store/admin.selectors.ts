import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from '../store/admin.reducer';

export const selectUserState = createFeatureSelector<UserState>('admin');

export const selectAllUsers = createSelector(selectUserState, (state) =>
  state ? state.users : []
);
export const selectUserLoading = createSelector(
  selectUserState,
  (state) => state.loading
);
export const selectUserError = createSelector(
  selectUserState,
  (state) => state.error
);
