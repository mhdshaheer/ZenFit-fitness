export interface SignupPayload {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id?: string;
  username?: string;
  email?: string;
  role?: string;
  accessToken?: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}
