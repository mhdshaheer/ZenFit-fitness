import { Request, Response } from "express";
import { ISession } from "../../models/session.model";

export interface ISessionController {
  saveDraftSession(req: Request, res: Response): Promise<void>;
  saveSession(req: Request, res: Response): Promise<void>;
  getSession(req: Request, res: Response): Promise<Response<ISession>>;
}
