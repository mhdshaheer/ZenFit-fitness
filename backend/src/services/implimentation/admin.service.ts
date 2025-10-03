import { GetUsersParams, IUser } from "../../interfaces/user.interface";
import { UserModel } from "../../models/user.model";
import { inject, injectable } from "inversify";
import { UserDto } from "../../dtos/user.dtos";
import { mapToUserDto } from "../../mapper/user.mapper";
import { IUserRepository } from "../../repositories/interface/user.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";

@injectable()
export class AdminService {
  @inject(TYPES.UserRepository)
  private userRepository!: IUserRepository;

  async updateUserStatus(
    id: string,
    status: "active" | "blocked"
  ): Promise<IUser | null> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error("User not found");
    return await this.userRepository.updateStatus(id, status);
  }

  async getUsers(
    params: GetUsersParams
  ): Promise<{ data: UserDto[]; total: number }> {
    const filter: any = {
      role: { $ne: "admin" },
    };
    const { total, data } = await this.userRepository.getAllForTable({
      filter,
      ...params,
    });
    const userDtos = data.map(mapToUserDto);
    return { data: userDtos, total };
  }
}

export const adminService = new AdminService();
