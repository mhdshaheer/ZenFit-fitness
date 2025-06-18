import { Request, Response, NextFunction } from "express";

export interface IAuthController {
  signup(req: Request, res: Response, next: NextFunction): Promise<void>;
  login(req: Request, res: Response, next: NextFunction): Promise<void>;
  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
}
