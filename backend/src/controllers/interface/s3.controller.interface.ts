import { Response } from "express";
import { AuthRequest } from "../../shared/types/authRequest.interface";

export interface IFileController {
  upload(req: AuthRequest, res: Response): Promise<void>;
  getFile(req: AuthRequest, res: Response): Promise<void>;
  deleteFile(req: AuthRequest, res: Response): Promise<void>;
}
