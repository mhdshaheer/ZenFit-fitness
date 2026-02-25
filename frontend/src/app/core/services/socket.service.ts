import { inject, Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private _socket!: Socket;
  private _logger = inject(LoggerService);
  private readonly _meetingEvents = new Map<string, Subject<unknown>>();
  private readonly _zone = inject(NgZone);

  constructor() {
    this._socket = io(environment.socketUrl, {
      reconnection: true,
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Connection events
    this._socket.on('connect', () => {
      this._logger.info('Socket connected:', this._socket.id);
    });

    this._socket.on('disconnect', (reason) => {
      this._logger.info('Socket disconnected:', reason);
    });

    this._socket.on('connect_error', (error) => {
      this._logger.error('Socket connection error:', error);
    });
  }

  /**
   * Emit a socket event
   */
  emit<T = unknown>(event: string, data: T): void {
    this._logger.info('Emitting event:', event, data);
    this._socket.emit(event, data);
  }

  /**
   * Listen to a socket event
   */
  on<T = unknown>(event: string): Observable<T> {
    if (!this._meetingEvents.has(event)) {
      const subject = new Subject<T>();
      this._meetingEvents.set(event, subject as Subject<unknown>);

      this._socket.on(event, (data: T) => {
        this._logger.info('Received event:', event, data);
        this._zone.run(() => subject.next(data));
      });
    }

    return (this._meetingEvents.get(event) as Subject<T>)!.asObservable();
  }

  /**
   * Stop listening to a specific event
   */
  off(event: string): void {
    if (this._meetingEvents.has(event)) {
      this._socket.off(event);
      this._meetingEvents.get(event)?.complete();
      this._meetingEvents.delete(event);
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    this._socket.disconnect();
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this._socket.id;
  }
}
