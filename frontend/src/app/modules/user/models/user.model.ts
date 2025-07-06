export interface User {
  name: string;
  email: string;
  password: string;
  dob: string;
  age: number;
}
export interface SignupPayload {
  username: string;
  email: string;
  password: string;
}
export interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}
