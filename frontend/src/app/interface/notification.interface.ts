export interface INotification {
  _id: string;
  title: string;
  message: string;
  receiverId: string;
  receiverType: 'user' | 'trainer' | 'admin';
  isRead: boolean;
  createdAt: string;
}
