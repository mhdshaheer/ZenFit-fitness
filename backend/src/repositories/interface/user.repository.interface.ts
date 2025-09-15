import { IUser } from "../../interfaces/user.interface";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  createUser(user: IUser): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  findById(id: string): Promise<IUser | null>;
  updateStatus(
    id: string,
    status: "active" | "blocked" | "pending" | "inactive"
  ): Promise<IUser | null>;
  updateById(id: string, data: Partial<IUser>): Promise<IUser | null>;
  updatePassword(email: string, newPassword: string): Promise<IUser | null>;

  // GOOGLE
  createGoogleUser(userData: {
    email: string;
    username: string;
    role: string;
    googleId?: string;
  }): Promise<IUser>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
}
