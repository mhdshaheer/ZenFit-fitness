import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types/authRequest.interface";
export interface IProfileController {
  getProfile(req: Request, res: Response): Promise<void>;
  updateProfile(req: AuthRequest, res: Response): Promise<void>;
  verifyResume(req: Request, res: Response): Promise<void>;
  changePassword(req: AuthRequest, res: Response): Promise<void>;
}
