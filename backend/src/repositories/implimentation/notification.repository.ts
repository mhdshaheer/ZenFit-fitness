import {
  INotification,
  NotificationModel,
} from "../../models/notification.model";
import { BaseRepository } from "../base.repository";
import { INotificationRepository } from "../interface/notification.repository.interface";
import { injectable } from "inversify";

@injectable()
export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository {
  constructor() {
    super(NotificationModel);
  }
  async createNotification(
    data: Partial<INotification>
  ): Promise<INotification> {
    return await this.create(data);
  }
  async getNotificationsByReceiver(
    receiverId: string
  ): Promise<INotification[]> {
    return this.model.find({ receiverId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string): Promise<INotification | null> {
    return this.model.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await this.model
      .updateMany({ _id: { $in: notificationIds } }, { $set: { isRead: true } })
      .exec();
  }

  async deleteOldNotifications(daysOld: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.model
      .deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true,
      })
      .exec();
  }
}
