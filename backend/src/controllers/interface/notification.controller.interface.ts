import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";

export interface INotificationController {
  getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void>;
  markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
  markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
