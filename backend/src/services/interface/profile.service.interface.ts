import { UserDto } from "../../dtos/user.dtos";
import { IUser } from "../../interfaces/user.interface";

export interface IProfileService {
  getProfile(id: string): Promise<UserDto>;
  updateProfile(id: string, data: IUser): Promise<UserDto>;
}
