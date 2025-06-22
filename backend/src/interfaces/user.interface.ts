export interface IUser {
  username?: string;
  email: string;
  password?: string;
  dob?: Date;
  gender?: "male" | "female" | "other";
  role: "admin" | "trainer" | "user";
}
