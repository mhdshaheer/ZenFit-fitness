export interface IUserResponse {
  id: string;
  fullName: string;
  username: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | null;
  phone: string | null;
  profileImage: string;
  resume: string;
  resumeVerified: boolean;
  role: 'trainer';
  status: 'active' | 'inactive' | 'blocked';
  languages: string[];
  googleId?: string;
}

export interface ILoggedUser {
  id: string;
  role: 'user' | 'trainer' | 'admin';
}
