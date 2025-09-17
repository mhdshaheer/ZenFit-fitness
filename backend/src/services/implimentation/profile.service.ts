import { inject, injectable } from "inversify";
import { IPassword, IUser } from "../../interfaces/user.interface";
import { IProfileService } from "../interface/profile.service.interface";
import { mapToUserDto } from "../../mapper/user.mapper";
import { UserDto } from "../../dtos/user.dtos";
import { comparePassword, hashedPassword } from "../../shared/utils/hash.util";
import { IUserRepository } from "../../repositories/interface/user.repository.interface";
import { TYPES } from "../../shared/types/inversify.types";

@injectable()
export class ProfileService implements IProfileService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}
  async getProfile(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);
    if (user) {
      const profileDto = mapToUserDto(user);
      return profileDto;
    } else {
      throw new Error("User not found");
    }
  }
  async updateProfile(userId: string, userData: IUser): Promise<UserDto> {
    const updateProfile = await this.userRepository.updateById(userId, userData);
    if (updateProfile) {
      const profileDto = mapToUserDto(updateProfile);
      console.log("update profile on service: ", profileDto);
      return profileDto;
    } else {
      throw new Error("User not found");
    }
  }

  async updateProfileImage(id: string, key: string) {
    return this.userRepository.updateById(id, { profileImage: key });
  }

  async removeProfileImage(id: string) {
    return this.userRepository.updateById(id, { profileImage: "" });
  }

  async updateResumePdf(id: string, key: string) {
    return this.userRepository.updateById(id, { resume: key });
  }
  async removeResumePdf(id: string) {
    return this.userRepository.updateById(id, {
      resumeVerified: false,
      resume: "",
    });
  }
  async verifyResume(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);

    const updated = await this.userRepository.updateById(id, {
      resumeVerified: !user?.resumeVerified,
    });
    return updated?.resumeVerified!;
  }
  async changePassword(id: string, passwords: IPassword): Promise<boolean> {
    const user = await this.userRepository.findById(id);
    const { currentPassword, newPassword } = passwords;

    const isPasswordValid = await comparePassword(
      currentPassword,
      user?.password!
    );
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const hashedNewPassword = await hashedPassword(newPassword);
    const updatedUser = await this.userRepository.updateById(id, {
      password: hashedNewPassword,
    });
    return !!updatedUser;
  }
}
