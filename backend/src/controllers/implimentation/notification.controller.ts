import { Response, NextFunction } from "express";
import { INotificationController } from "../interface/notification.controller.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "../../shared/types/inversify.types";
import { INotificationService } from "../../services/interface/notification.service.interface";
import { AuthenticatedRequest } from "../../types/authenticated-request.type";
import { HttpResponse } from "../../const/response_message.const";
import { HttpStatus } from "../../const/statuscode.const";

@injectable()
export class NotificationController implements INotificationController {
  @inject(TYPES.NotificationService)
  private readonly _notificationService!: INotificationService;

  async getNotifications(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const receiverId = req.user?.id;
      if (!receiverId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: HttpResponse.UNAUTHORIZED });
        return;
      }
      const notifications = await this._notificationService.getNotifications(
        receiverId
      );
      res.status(HttpStatus.OK).json(notifications);
    } catch (error) {
      next(error);
    }
  }
  async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { notificationId } = req.params;
      const notification = await this._notificationService.markAsRead(
        notificationId
      );

      if (!notification) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: HttpResponse.NOTIFICATION_NOT_FOUND });
        return;
      }

      res.status(HttpStatus.OK).json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const receiverId = req.user?.id;
      if (!receiverId) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ message: HttpResponse.UNAUTHORIZED });
        return;
      }
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids)) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: HttpResponse.INVALID_NOTIFICATION_IDS });
        return;
      }

      await this._notificationService.markAllAsRead(receiverId, ids);
      res
        .status(HttpStatus.OK)
        .json({ message: HttpResponse.NOTIFICATIONS_MARKED_AS_READ });
    } catch (error) {
      next(error);
    }
  }
}
