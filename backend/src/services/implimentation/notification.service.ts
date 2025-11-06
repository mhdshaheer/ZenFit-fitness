import { inject } from "inversify";
import { INotification } from "../../models/notification.model";
import { getIO } from "../../shared/sockets/socket";
import { INotificationService } from "../interface/notification.service.interface";
import { TYPES } from "../../shared/types/inversify.types";
import { INotificationRepository } from "../../repositories/interface/notification.repository.interface";

export class NotificationService implements INotificationService {
  @inject(TYPES.NotificationRepository)
  private readonly _notificationRepository!: INotificationRepository;

  async createNotification(
    receiverId: string,
    receiverType: "user" | "trainer" | "admin",
    title: string,
    message: string
  ): Promise<INotification> {
    const notification = await this._notificationRepository.createNotification({
      receiverId,
      receiverType,
      title,
      message,
    });

    // Emit the notification in real-time
    const io = getIO();
    io.to(`${receiverType}-${receiverId}`).emit(
      "newNotification",
      notification
    );

    return notification;
  }

  async getNotifications(receiverId: string): Promise<INotification[]> {
    return await this._notificationRepository.getNotificationsByReceiver(
      receiverId
    );
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return await this._notificationRepository.markAsRead(notificationId);
  }
}
