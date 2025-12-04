import { Request, Response } from "express";
import { UserDto } from "../../dtos/user.dtos";
import { ILoggedUser } from "../../interfaces/user.interface";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";
export interface IProfileController {
  getUserByUserId(req: Request, res: Response): Promise<Response<UserDto>>;
  getProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
  updateProfile(req: AuthenticatedRequest, res: Response): Promise<void>;
  verifyResume(req: Request, res: Response): Promise<void>;
  changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
  getCurrentUserId(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<Response<ILoggedUser>>;
}
