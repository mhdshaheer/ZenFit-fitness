import { IUser } from "../../interfaces/user.interface";
import { UserModel } from "../../models/user.model";
import { BaseRepository } from "../base.repository";
import { IUserRepository } from "../interface/user.repository.interface";

export class UserRepository
  extends BaseRepository<IUser>
  implements IUserRepository
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

  async updatePassword(
    email: string,
    newPassword: string
  ): Promise<IUser | null> {
    return await this.model.findOneAndUpdate(
      { email },
      { password: newPassword },
      { new: true }
    );
  }

  // =========== Google signup ==========

  async createGoogleUser(userData: {
    email: string;
    username: string;
    role: string;
    googleId?: string;
  }) {
    const user = new UserModel(userData);
    return await user.save();
  }
  async findByGoogleId(googleId: string) {
    return await UserModel.findOne({ googleId });
  }
}
