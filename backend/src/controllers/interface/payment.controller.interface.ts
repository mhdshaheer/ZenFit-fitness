import { Request, Response } from "express";

export interface IPaymentController {
  createCheckoutSession(req: Request, res: Response): Promise<void>;
  webhook(req: Request, res: Response): Promise<void>;
}
