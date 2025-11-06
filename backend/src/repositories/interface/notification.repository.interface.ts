import { INotification } from "../../models/notification.model";

export interface INotificationRepository {
  createNotification(data: Partial<INotification>): Promise<INotification>;
  getNotificationsByReceiver(receiverId: string): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markMultipleAsRead(notificationIds: string[]): Promise<void>;
  deleteOldNotifications(daysOld: number): Promise<void>;
}
