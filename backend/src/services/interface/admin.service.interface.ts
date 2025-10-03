import { GetUsersParams, IUser } from "../../interfaces/user.interface";
import { UserDto } from "../../dtos/user.dtos";

export interface IAdminService {
  getUsers(params: GetUsersParams): Promise<{ data: UserDto[]; total: number }>;
  updateUserStatus(
    id: string,
    status: "active" | "blocked"
  ): Promise<IUser | null>;
}
