import { Request, Response } from "express";
export interface IProfileController {
  getProfile(req: Request, res: Response): Promise<void>;
  //   updateProfile(req: Request, res: Response): Promise<void>;
}
