import { Request, Response } from "express";

export interface ISessionController {
  saveDraftSession(req: Request, res: Response): Promise<void>;
  saveSession(req: Request, res: Response): Promise<void>;
}
