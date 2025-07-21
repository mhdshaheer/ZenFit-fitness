import { AdminRepository } from "../../repositories/implimentation/admin.repository";
import { IUser } from "../../interfaces/user.interface";
import { AuthRepository } from "../../repositories/implimentation/auth.repository";
import { UserModel } from "../../models/user.model";

interface GetUsersParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 1 | -1;
}

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

  async getUsers({
    page,
    pageSize,
    search = "",
    sortBy = "createdAt",
    sortOrder = 1,
  }: GetUsersParams): Promise<{ data: IUser[]; total: number }> {
    const filter: any = {
      role: { $ne: "admin" },
    };

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await UserModel.countDocuments(filter);

    // Fetch users with filter, sort, pagination
    const users = await UserModel.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return { data: users, total };
  }
}

export const adminService = new AdminService();
