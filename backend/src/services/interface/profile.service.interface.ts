import { UserDto } from "../../dtos/user.dtos";
import { IPassword, IUser } from "../../interfaces/user.interface";

export interface IProfileService {
  getProfile(userId: string): Promise<UserDto>;
  updateProfile(userId: string, data: IUser): Promise<UserDto>;
  updateProfileImage(userId: string, key: string): Promise<any>;
  removeProfileImage(userId: string): Promise<any>;
  updateResumePdf(userId: string, key: string): Promise<any>;
  removeResumePdf(userId: string): Promise<any>;
  verifyResume(userId: string): Promise<boolean>;
  changePassword(userId: string, passwords: IPassword): Promise<boolean>;
  getUsersByRole(role: string): Promise<UserDto[]>;
}
