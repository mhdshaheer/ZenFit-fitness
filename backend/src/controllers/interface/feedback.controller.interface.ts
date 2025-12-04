import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export interface IFeedbackController {
  createOrUpdateFeedback(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  getFeedbackBySlotAndDate(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  getFeedbacksBySlotId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void>;

  deleteFeedback(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}
