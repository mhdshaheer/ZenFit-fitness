import { Request, Response, NextFunction } from "express";
import { INotificationController } from "../interface/notification.controller.interface";
import { inject } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { INotificationService } from "../../services/interface/notification.service.interface";

// @controller('/notifications')
export class NotificationController implements INotificationController {
  @inject(TYPES.NotificationService)
  private readonly _notificationService!: INotificationService;

  async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const receiverId = (req as any).user.id;
      const notifications = await this._notificationService.getNotifications(
        receiverId
      );
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }
  async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { notificationId } = req.params;
      const notification = await this._notificationService.markAsRead(
        notificationId
      );

      if (!notification) {
        res.status(404).json({ message: "Notification not found" });
        return;
      }

      res.status(200).json(notification);
    } catch (error) {
      next(error);
    }
  }
}
