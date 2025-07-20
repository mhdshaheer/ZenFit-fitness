import { ITempUser, TempUserModel } from "../../models/otp.model";

export class TempUserRepository {
  async saveTempUser(
    email: string,
    otp: string,
    payload: object
  ): Promise<ITempUser> {
    return await TempUserModel.create({ email, otp, payload });
  }

  async findByEmail(email: string): Promise<ITempUser | null> {
    return await TempUserModel.findOne({ email });
  }

  async deleteByEmail(email: string): Promise<void> {
    await TempUserModel.deleteOne({ email });
  }

  async updateOtp(email: string, newOtp: string) {
    return await TempUserModel.updateOne(
      { email },
      {
        $set: {
          otp: newOtp,
          createdAt: Date.now(),
        },
      }
    );
  }
}
