import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, Subject, switchMap, take, takeUntil } from 'rxjs';
import { NotificationSocketService } from '../../../core/services/notificationSocket.service';
import { INotification } from '../../../interface/notification.interface';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notificaiton.service';
import { ProfileService } from '../../../core/services/profile.service';

type NotificationTab = 'unread' | 'read';

@Component({
  selector: 'zenfit-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: INotification[] = [];
  isDropdownOpen = false;
  isLoading = false;
  isConnected = false;
  activeTab: NotificationTab = 'unread';

  @Input() recieverId = '';

  private readonly _destroy$ = new Subject<void>();
  private readonly _notificationSocket = inject(NotificationSocketService);
  private readonly _notificationService = inject(NotificationService);
  private readonly _profileService = inject(ProfileService);
  private readonly _cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.initializeNotifications();
  }

  private initializeNotifications(): void {
    this._profileService
      .getCurrentUserId()
      .pipe(
        switchMap((res) => {
          const userId = res.id;
          this.recieverId = userId;

          return this._notificationSocket.getConnectionStatus$().pipe(
            map((status) => {
              return { status, res };
            })
          );
        }),
        takeUntil(this._destroy$)
      )
      .subscribe({
        next: ({ status, res }) => {
          this.isConnected = status;
          if (status) {
            this._notificationSocket.joinRoom(res.id, res.role);
          }
          this._cdr.markForCheck();
        },
      });

    // 2️⃣ Listen for real-time notifications
    this._notificationSocket
      .getNotifications$()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (notification) => {
          this.notifications.unshift(notification);
          this._cdr.markForCheck();
          this.showBrowserNotification(notification);
        },
        error: (error) => console.error('Notification stream error:', error),
      });

    // 3️⃣ Load existing notifications
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.isLoading = true;
    this._notificationService
      .getNotification()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.isLoading = false;
          this._cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load notifications:', error);
          this.isLoading = false;
          this._cdr.markForCheck();
        },
      });
  }

  setActiveTab(tab: NotificationTab): void {
    this.activeTab = tab;
    this._cdr.markForCheck();
  }

  get filteredNotifications(): INotification[] {
    if (this.activeTab === 'unread') {
      return this.notifications.filter((n) => !n.isRead);
    }
    return this.notifications.filter((n) => n.isRead);
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  markAsRead(notification: INotification): void {
    if (notification.isRead) return;

    notification.isRead = true;
    this._cdr.markForCheck();

    this._notificationService
      .readNotification(notification._id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        error: (error) => {
          console.error('Failed to mark as read:', error);
          notification.isRead = false;
          this._cdr.markForCheck();
        },
      });
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications
      .filter((n) => !n.isRead)
      .map((n) => n._id);

    if (unreadIds.length === 0) return;

    this.notifications.forEach((n) => (n.isRead = true));
    this._cdr.markForCheck();

    this._notificationService
      .markAllAsRead(unreadIds)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        error: (error) => {
          console.error('Failed to mark all as read:', error);
          this.loadNotifications();
        },
      });
  }

  private showBrowserNotification(notification: INotification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png',
      });
    }
  }

  requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications.some((n) => !n.isRead);
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  get readCount(): number {
    return this.notifications.filter((n) => n.isRead).length;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._notificationSocket.disconnect();
  }
}
