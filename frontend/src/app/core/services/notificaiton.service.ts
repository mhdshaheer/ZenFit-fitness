import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { NotificationRoutes } from '../constants/api-routes.const';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { INotification } from '../../interface/notification.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _apiUrl = environment.apiUrl + NotificationRoutes.BASE;
  private readonly _http = inject(HttpClient);

  getNotification(): Observable<INotification[]> {
    return this._http.get<INotification[]>(`${this._apiUrl}`);
  }

  readNotification(notificationId: string) {
    return this._http.patch(`${this._apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(unreadIds: string[]) {
    return this._http.patch(`${this._apiUrl}/mark-all-read`, {
      ids: unreadIds,
    });
  }
}
