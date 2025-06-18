import { Request, Response, NextFunction } from "express";
import { IAuthController } from "../interface/auth.controller.interface";
import {authService}

export class authController implements IAuthController {
  constructor(private authService:IAuthS){};
  signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error("Method not implemented.");
  }
  login(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error("Method not implemented.");
  }
  forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
