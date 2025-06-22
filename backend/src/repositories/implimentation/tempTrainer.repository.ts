import { ITempTrainer, TempTrainerModel } from "../../models/otp.model";

export class TempTrainerRepository {
  async saveTempTrainer(
    email: string,
    otp: string,
    payload: object
  ): Promise<ITempTrainer> {
    return await TempTrainerModel.create({ email, otp, payload });
  }

  async findByEmail(email: string): Promise<ITempTrainer | null> {
    return await TempTrainerModel.findOne({ email });
  }

  async deleteByEmail(email: string): Promise<void> {
    await TempTrainerModel.deleteOne({ email });
  }
}
