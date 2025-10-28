import { GetUsersParams, IUser } from "../../interfaces/user.interface";
import { inject, injectable } from "inversify";
import { UserDto, UserStatusDto } from "../../dtos/user.dtos";
import { mapToUserDto, mapToUserStatusDto } from "../../mapper/user.mapper";
import { IUserRepository } from "../../repositories/interface/user.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { IAdminService } from "../interface/admin.service.interface";
import { AppError } from "../../shared/utils/appError.util";
import { HttpResponse } from "../../const/response_message.const";
import { HttpStatus } from "../../const/statuscode.const";

@injectable()
export class AdminService implements IAdminService {
  @inject(TYPES.UserRepository)
  private readonly _userRepository!: IUserRepository;

  async updateUserStatus(
    id: string,
    status: "active" | "blocked"
  ): Promise<UserStatusDto> {
    const user = await this._userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    const updatedUser = await this._userRepository.updateStatus(id, status);
    if (!updatedUser) {
      throw new AppError(HttpResponse.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const mappedUser = mapToUserStatusDto(updatedUser, status);
    return mappedUser;
  }

  async getUsers(
    params: GetUsersParams
  ): Promise<{ data: UserDto[]; total: number }> {
    const filter = {
      role: { $ne: "admin" },
    };
    const { total, data } = await this._userRepository.getAllForTable({
      filter,
      ...params,
    });
    const userDtos = data.map(mapToUserDto);
    return { data: userDtos, total };
  }
}

export const adminService = new AdminService();
