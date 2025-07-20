import { IUser } from "../../interfaces/user.interface";

export interface IAdminRepository {
  findByEmail(email: string): Promise<IUser | null>;
  updateStatus(id: string, status: "active" | "blocked"): Promise<IUser | null>;
}
