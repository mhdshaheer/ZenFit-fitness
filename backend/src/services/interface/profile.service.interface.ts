import { UserDto } from "../../dtos/user.dtos";
import { IPassword, IUser } from "../../interfaces/user.interface";

export interface IProfileService {
  getProfile(userId: string): Promise<UserDto>;
  updateProfile(userId: string, data: IUser): Promise<UserDto>;
  updateProfileImage(userId: string, key: string): void;
  removeProfileImage(userId: string): void;
  updateResumePdf(userId: string, key: string): void;
  removeResumePdf(userId: string): void;
  verifyResume(userId: string): Promise<boolean>;
  changePassword(userId: string, passwords: IPassword): Promise<boolean>;
}
