import { Request, Response } from "express";
import { ISession } from "../../models/session.model";
import { AuthRequest } from "../../shared/types/authRequest.interface";

export interface ISessionController {
  saveDraftSession(req: AuthRequest, res: Response): Promise<void>;
  saveSession(req: AuthRequest, res: Response): Promise<void>;
  getSession(req: Request, res: Response): Promise<Response<ISession>>;
}
