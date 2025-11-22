import { Request, Response, NextFunction } from "express";

export interface IFeedbackController {
  createOrUpdateFeedback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  getFeedbackBySlotAndDate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  getFeedbacksBySlotId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  deleteFeedback(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
