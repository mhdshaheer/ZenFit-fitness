import { IUser } from "../../interfaces/user.interface";
import { UserModel } from "../../models/user.model";
import { BaseRepository } from "../base.repository";
import { IAdminRepository } from "../interface/admin.repository.interface";
import { IAuthRepository } from "../interface/auth.repository.interface";

export class AdminRepository
  extends BaseRepository<IUser>
  implements IAdminRepository
{
  constructor() {
    super(UserModel);
  }
  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }
  async updateStatus(
    id: string,
    status: "active" | "blocked"
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
