export interface AuthResponse {
  token: string;
  role: 'admin' | 'user' | 'trainer';
}
