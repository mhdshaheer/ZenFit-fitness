import { Request, Response } from "express";
import { ITrainer } from "../../interfaces/trainer.interface";

export interface ITrainerAuthService {
  signup(userData: ITrainer): Promise<ITrainer>;
  verifyOtp(req: Request, res: Response): Promise<void>;
}
