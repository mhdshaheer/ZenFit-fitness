import { GetUsersParams, IUser } from "../../interfaces/user.interface";
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
    return await this.model.find();
  }
  async findById(id: string): Promise<IUser | null> {
    return await this.model.findById(id);
  }
  async updateStatus(
    id: string,
    status: "active" | "blocked" | "pending" | "inactive"
  ): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(id, { status }, { new: true });
  }
  async updateById(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return await this.update(id, data);
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

  async getAllForTable(
    options: GetUsersParams
  ): Promise<{ total: number; data: IUser[] }> {
    const {
      filter = {},
      sortBy = "createdAt",
      sortOrder = "asc",
      page = 1,
      pageSize = 10,
      search = "",
    } = options;

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const total = await UserModel.countDocuments(filter);

    // Fetch users with filter, sort, pagination
    const users = await UserModel.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return { total, data: users };
  }
  // =========== Google signup ==========

  async createGoogleUser(userData: {
    email: string;
    username: string;
    role: string;
    googleId?: string;
  }) {
    const user = new this.model(userData);
    return await user.save();
  }
  async findByGoogleId(googleId: string) {
    return await this.model.findOne({ googleId });
  }
}
