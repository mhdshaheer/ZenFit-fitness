import { IUser } from "../../interfaces/user.interface";
import { UserModel } from "../../models/user.model";
import { BaseRepository } from "../base.repository";
import { IAuthRepository } from "../interface/auth.repository.interface";

export class AuthRepository
  extends BaseRepository<IUser>
  implements IAuthRepository
{
  constructor() {
    super(UserModel);
  }
  async findByEmail(email: string): Promise<IUser | null> {
    return await this.findOne({ email });
  }
  async createUser(user: IUser): Promise<IUser> {
    return await this.create(user);
  }
  async findAll(): Promise<IUser[]> {
    return await UserModel.find();
  }
  async findById(id: string): Promise<IUser | null> {
    return await UserModel.findById(id);
  }
  async updateStatus(
    id: string,
    status: "active" | "blocked" | "pending" | "inactive"
  ): Promise<IUser | null> {
    return await UserModel.findByIdAndUpdate(id, { status }, { new: true });
  }
}
