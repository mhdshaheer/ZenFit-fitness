import { INotification } from "../../models/notification.model";

export interface INotificationService {
  createNotification(
    receiverId: string,
    receiverType: "user" | "trainer" | "admin",
    title: string,
    message: string
  ): Promise<INotification>;
  getNotifications(receiverId: string): Promise<INotification[]>;
  markAsRead(notificationId: string): Promise<INotification | null>;
  markAllAsRead(receiverId: string, notificationIds: string[]): Promise<void>;
}
