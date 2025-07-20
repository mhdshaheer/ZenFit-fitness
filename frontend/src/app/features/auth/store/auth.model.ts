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

// export interface User {
//   id: string;
//   username: string;
//   email: string;
//   role: string;
// }

// export interface AuthState {
//   user: User | null;
//   accessToken: string | null;
//   refreshToken: string | null;

//   login: {
//     loading: boolean;
//     error: string | null;
//   };

//   signup: {
//     loading: boolean;
//     error: string | null;
//   };
// }
