import { ITempUser } from "../../models/tempUser.model";

export interface ITempUserRepository {
  saveTempUser(email: string, otp: string, payload: object): Promise<ITempUser>;
  findByEmail(email: string): Promise<ITempUser | null>;
  deleteByEmail(email: string): Promise<void>;
  updateOtp(email: string, newOtp: string): Promise<Partial<ITempUser> | null>;
}
