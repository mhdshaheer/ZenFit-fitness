import { injectable } from "inversify";
import { IPassword, IUser } from "../../interfaces/user.interface";
import { IProfileService } from "../interface/profile.service.interface";
import { UserRepository } from "../../repositories/implimentation/user.repository";
import { mapToUserDto } from "../../mapper/user.mapper";
import { UserDto } from "../../dtos/user.dtos";
import { comparePassword, hashedPassword } from "../../utils/hash.util";

@injectable()
export class ProfileService implements IProfileService {
  private userRepository = new UserRepository();
  async getProfile(userId: string): Promise<UserDto> {
    let user = await this.userRepository.findById(userId);
    if (user) {
      let profileDto = mapToUserDto(user);
      return profileDto;
    } else {
      throw new Error("User not found");
    }
  }
  async updateProfile(userId: string, userData: IUser): Promise<UserDto> {
    let updateProfile = await this.userRepository.update(userId, userData);
    if (updateProfile) {
      let profileDto = mapToUserDto(updateProfile);
      console.log("update profile on service: ", profileDto);
      return profileDto;
    } else {
      throw new Error("User not found");
    }
  }

  async updateProfileImage(id: string, key: string) {
    return this.userRepository.update(id, { profileImage: key });
  }

  async removeProfileImage(id: string) {
    return this.userRepository.update(id, { profileImage: "" });
  }

  async updateResumePdf(id: string, key: string) {
    return this.userRepository.update(id, { resume: key });
  }
  async removeResumePdf(id: string) {
    return this.userRepository.update(id, {
      resumeVerified: false,
      resume: "",
    });
  }
  async verifyResume(id: string): Promise<boolean> {
    let user = await this.userRepository.findById(id);

    let updated = await this.userRepository.update(id, {
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
    const updatedUser = await this.userRepository.update(id, {
      password: hashedNewPassword,
    });
    return !!updatedUser;
  }
}
