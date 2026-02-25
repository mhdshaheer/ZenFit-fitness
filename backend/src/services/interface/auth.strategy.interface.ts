import { IUser } from "../../interfaces/user.interface";

export interface IAuthStrategy {
    name: string;
    authenticate(credentials: unknown): Promise<IUser>;
}
