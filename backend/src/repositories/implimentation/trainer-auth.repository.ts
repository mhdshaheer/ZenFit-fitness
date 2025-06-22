import { ITrainer } from "../../interfaces/trainer.interface";
import { TrainerModel } from "../../models/trainer.model";
import { BaseRepository } from "../base.repository";
import { ITrainerAuthRepository } from "../interface/trainer-auth.repository.interface";

export class TrainerAuthRepository
  extends BaseRepository<ITrainer>
  implements ITrainerAuthRepository
{
  constructor() {
    super(TrainerModel);
  }

  async findByEmail(email: string): Promise<ITrainer | null> {
    return this.findOne({ email });
  }

  async createTrainer(trainer: ITrainer): Promise<ITrainer> {
    return this.create(trainer);
  }
}
