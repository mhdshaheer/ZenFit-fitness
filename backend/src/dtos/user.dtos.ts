export interface UserDto {
  id: string;
  username: string;
  email: string;
  gender?: string;
  phone?: number;
  dob?: Date;
  address?: string;
  role: "admin" | "user" | "trainer";
  status: string;
  profileImage?: string;
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
