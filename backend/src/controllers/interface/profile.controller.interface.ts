import { Request, Response } from "express";
import { UserDto } from "../../dtos/user.dtos";
export interface IProfileController {
  getUserByUserId(req: Request, res: Response): Promise<Response<UserDto>>;
  getProfile(req: Request, res: Response): Promise<void>;
  updateProfile(req: Request, res: Response): Promise<void>;
  verifyResume(req: Request, res: Response): Promise<void>;
  changePassword(req: Request, res: Response): Promise<void>;
}
