import { Request } from "express";
import { IJwtPayload } from "../../interfaces/auth.interface";

export interface AuthRequest extends Request {
  user?: IJwtPayload;
}
