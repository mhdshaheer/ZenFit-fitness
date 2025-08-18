import { Request, Response } from "express";

export interface IFileController {
  upload(req: Request, res: Response): Promise<void>;
  getFile(req: Request, res: Response): Promise<void>;
  deleteFile(req: Request, res: Response): Promise<void>;
}
