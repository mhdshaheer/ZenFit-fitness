import { inject, Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { INotification } from '../../interface/notification.interface';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {
  private _socket!: Socket;
  private _notificationSubject = new Subject<INotification>();
  private _connectionStatus = new BehaviorSubject<boolean>(false);
  private _loggerService = inject(LoggerService);

  constructor(private _ngZone: NgZone) {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    this._socket = io(environment.socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    // Handle connection events
    this._socket.on('connect', () => {
      this._loggerService.info('Socket connected:', this._socket.id);
      this._connectionStatus.next(true);
    });

    this._socket.on('disconnect', (reason) => {
      this._loggerService.warn('Socket disconnected:', reason);
      this._connectionStatus.next(false);
    });

    this._socket.on('connect_error', (error) => {
      this._loggerService.error('Socket connection error:', error);
    });

    // Listen for notifications
    this._socket.on('newNotification', (data: INotification) => {
      // Run inside Angular zone for change detection
      this._ngZone.run(() => {
        this._notificationSubject.next(data);
      });
    });
  }

  // ✅ FIXED: Send room name as string
  joinRoom(id: string, type: 'user' | 'trainer' | 'admin'): void {
    if (!id || !type) {
      this._loggerService.error('Cannot join room: missing id or type', {
        id,
        type,
      });
      return;
    }

    const roomName = `${type}-${id}`;
    const roomData = { id, type };

    if (this._socket.connected) {
      this._socket.emit('join', roomData);
      this._loggerService.info(`Joined room: ${roomName}`);
    } else {
      this._loggerService.error('Cannot join room: Socket not connected');
      // ✅ Retry when connected
      this._socket.once('connect', () => {
        this._socket.emit('join', roomData);
        this._loggerService.info(`Joined room after reconnect: ${roomName}`);
      });
    }
  }

  getNotifications$(): Observable<INotification> {
    return this._notificationSubject.asObservable();
  }

  getConnectionStatus$(): Observable<boolean> {
    return this._connectionStatus.asObservable();
  }

  disconnect(): void {
    if (this._socket) {
      this._socket.disconnect();
      this._notificationSubject.complete();
      this._connectionStatus.complete();
    }
  }

  isConnected(): boolean {
    return this._socket?.connected ?? false;
  }
}
