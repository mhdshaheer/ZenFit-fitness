import { inject, injectable } from "inversify";
import { IPassword, IUser } from "../../interfaces/user.interface";
import { IProfileService } from "../interface/profile.service.interface";
import { mapToUserDto } from "../../mapper/user.mapper";
import { UserDto } from "../../dtos/user.dtos";
import { comparePassword, hashedPassword } from "../../shared/utils/hash.util";
import { IUserRepository } from "../../repositories/interface/user.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { AppError } from "../../shared/utils/appError.util";
import { HttpResponse } from "../../const/response_message.const";
import { HttpStatus } from "../../const/statuscode.const";

@injectable()
export class ProfileService implements IProfileService {
  @inject(TYPES.UserRepository)
  private readonly _userRepository!: IUserRepository;

  async getProfile(userId: string): Promise<UserDto> {
    const user = await this._userRepository.findById(userId);
    if (user) {
      const profileDto = mapToUserDto(user);
      return profileDto;
    } else {
      throw new Error("User not found");
    }
  }
  async updateProfile(userId: string, userData: IUser): Promise<UserDto> {
    const updateProfile = await this._userRepository.updateById(
      userId,
      userData
    );
    if (updateProfile) {
      const profileDto = mapToUserDto(updateProfile);
      return profileDto;
    } else {
      throw new Error("User not found");
    }
  }

  async updateProfileImage(userId: string, key: string) {
    return this._userRepository.updateById(userId, { profileImage: key });
  }

  async removeProfileImage(userId: string) {
    return this._userRepository.updateById(userId, { profileImage: "" });
  }

  async updateResumePdf(userId: string, key: string) {
    return this._userRepository.updateById(userId, { resume: key });
  }
  async removeResumePdf(userId: string) {
    return this._userRepository.updateById(userId, {
      resumeVerified: false,
      resume: "",
    });
  }
  async verifyResume(userId: string): Promise<boolean> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new AppError(HttpResponse.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const updated = await this._userRepository.updateById(userId, {
      resumeVerified: !(user.resumeVerified ?? false),
    });
    return updated?.resumeVerified!;
  }
  async changePassword(userId: string, passwords: IPassword): Promise<boolean> {
    const user = await this._userRepository.findById(userId);
    const { currentPassword, newPassword } = passwords;

    const isPasswordValid = await comparePassword(
      currentPassword,
      user?.password!
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const hashedNewPassword = await hashedPassword(newPassword);
    const updatedUser = await this._userRepository.updateById(userId, {
      password: hashedNewPassword,
    });
    return !!updatedUser;
  }

  async getUsersByRole(role: string): Promise<UserDto[]> {
    const users = await this._userRepository.getAllUsers();
    const filteredUsers = users.filter((item) => item.role == role);
    const mappedUsers = filteredUsers.map(mapToUserDto);
    return mappedUsers;
  }
}
