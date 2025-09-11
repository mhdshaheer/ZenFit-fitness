import { UserDto } from "../../dtos/user.dtos";
import { IUser } from "../../interfaces/user.interface";

export interface IProfileService {
  getProfile(id: string): Promise<UserDto>;
  updateProfile(id: string, data: IUser): Promise<UserDto>;
  updateProfileImage(id: string, key: string): void;
  removeProfileImage(id: string): void;
  updateResumePdf(id: string, key: string): void;
  removeResumePdf(id: string): void;
  verifyResume(id: string): Promise<boolean>;
}
