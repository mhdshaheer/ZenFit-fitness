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

export interface AuthState {
  user: any | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}
