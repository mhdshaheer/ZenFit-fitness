import { IUser } from "../../interfaces/user.interface";

export interface IProfileService {
  getProfile(id: string): Promise<IUser>;
}
