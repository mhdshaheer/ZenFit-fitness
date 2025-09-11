import { IUser } from "../../interfaces/user.interface";
import { Request, Response } from "express";

export interface IAuthService {
  signup(userData: IUser): Promise<IUser>;
  sendOtp(req: Request, res: Response): Promise<void>;
  verifyOtp(req: Request, res: Response): Promise<void>;
  resendOtp(req: Request, res: Response): Promise<void>;
  login(email: string, password: string): void;
  sendForgotPasswordOtp(email: string): void;
  verifyForgotOtp(email: string, otp: string): void;
  resetPassword(req: Request, res: Response): Promise<void>;

  logout(res: Response): Promise<void>;
}
