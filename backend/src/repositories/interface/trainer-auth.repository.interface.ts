import { ITrainer } from "../../interfaces/trainer.interface";

export interface ITrainerAuthRepository {
  findByEmail(email: string): Promise<ITrainer | null>;
  createTrainer(user: ITrainer): Promise<ITrainer>;
}
