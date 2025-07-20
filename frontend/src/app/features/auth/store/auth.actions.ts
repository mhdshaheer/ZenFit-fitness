import { createAction, props } from '@ngrx/store';
import { LoginPayload, SignupPayload } from './auth.model';

export const signup = createAction(
  '[Auth] Signup',
  props<{ payload: SignupPayload }>()
);

export const signupSuccess = createAction(
  '[Auth] Signup Success',
  props<{ email: string }>()
);

export const signupFailure = createAction(
  '[Auth] Signup Failure',
  props<{ error: string }>()
);

// Refresh token
export const refreshAccessToken = createAction('[Auth] Refresh Access Token');

export const refreshAccessTokenSuccess = createAction(
  '[Auth] Refresh Access Token Success',
  props<{ accessToken: string }>()
);
export const refreshAccessTokenFailure = createAction(
  '[Auth] Refresh Access Token Failure',
  props<{ error: string }>()
);

// Login
export const login = createAction(
  '[Auth] Login',
  props<{ payload: LoginPayload }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ accessToken: string; role: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// google signup

export const googleSignup = createAction(
  '[Auth] Google Signup',
  props<{ payload: { idToken: string; email: string; username: string } }>()
);

export const googleSignupSuccess = createAction(
  '[Auth] Google Signup Success',
  props<{ accessToken: string; refreshToken: string; role: string }>()
);

export const googleSignupFailure = createAction(
  '[Auth] Google Signup Failure',
  props<{ error: string }>()
);
