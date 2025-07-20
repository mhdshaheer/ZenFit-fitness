import { AdminRepository } from "../../repositories/implimentation/admin.repository";
import { IUser } from "../../interfaces/user.interface";
import { AuthRepository } from "../../repositories/implimentation/auth.repository";

export class AdminService {
  private adminRepository = new AdminRepository();
  private authRepository = new AuthRepository();

  async updateUserStatus(
    id: string,
    status: "active" | "blocked"
  ): Promise<IUser | null> {
    const user = await this.authRepository.findById(id);
    if (!user) throw new Error("User not found");
    return await this.adminRepository.updateStatus(id, status);
  }
  async getAllUsers(): Promise<IUser[]> {
    return await this.authRepository.findAll();
  }
}

export const adminService = new AdminService();
