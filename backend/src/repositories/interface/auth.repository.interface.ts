import { IUser } from "../../interfaces/user.interface";

export interface IAuthRepository {
  findByEmail(email: string): Promise<IUser | null>;
  createUser(user: IUser): Promise<IUser>;
}
