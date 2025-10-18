export interface IUserResponse {
  id: string;
  fullName: string;
  username: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string | null;
  profileImage: string;
  resume: string;
  resumeVerified: boolean;
  role: 'trainer';
  status: 'active' | 'inactive' | 'blocked';
}
