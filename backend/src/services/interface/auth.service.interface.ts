import { IUser } from "../../interfaces/user.interface";
import { Request, Response } from "express";

export interface IAuthService {
  signup(userData: IUser): Promise<IUser>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
}
