import { ITempUser, TempUserModel } from "../../models/tempUser.model";
import { ITempUserRepository } from "../interface/tempUser.repository.interface";
import { injectable } from "inversify";

@injectable()
export class TempUserRepository implements ITempUserRepository {
  async saveTempUser(
    email: string,
    otp: string,
    payload: object
  ): Promise<ITempUser> {
    return await TempUserModel.findOneAndUpdate(
      { email },
      { email, otp, payload },
      { new: true, upsert: true }
    );
  }

  async findByEmail(email: string): Promise<ITempUser | null> {
    return await TempUserModel.findOne({ email });
  }

  async deleteByEmail(email: string): Promise<void> {
    await TempUserModel.deleteOne({ email });
  }

  async updateOtp(
    email: string,
    newOtp: string
  ): Promise<Partial<ITempUser> | null> {
    return await TempUserModel.findOneAndUpdate(
      { email },
      {
        $set: {
          otp: newOtp,
          createdAt: new Date(),
        },
      },
      { new: true }
    ).lean();
  }
}
