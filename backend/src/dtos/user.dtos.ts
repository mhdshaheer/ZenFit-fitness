export interface UserDto {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  gender?: string;
  phone?: string;
  dob?: Date;
  address?: string;
  role: "admin" | "user" | "trainer";
  status: string;
  profileImage?: string;
  resume?: string;
  resumeVerified?: boolean;
  languages?: string[];
  createdAt?: Date;
}

export interface UserStatusDto {
  message: string;
  user: {
    _id: string;
    username: string;
    email: string;
    status: "active" | "blocked";
  };
}
