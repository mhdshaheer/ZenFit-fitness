import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private _socket!: Socket;
  private _meetingEvents: Map<string, Subject<any>> = new Map();

  constructor(private zone: NgZone) {
    this._socket = io(environment.socketUrl, { 
      reconnection: true, 
      withCredentials: true, 
      transports: ['websocket', 'polling'] 
    });
    
    // Connection events
    this._socket.on('connect', () => {
      console.log('Socket connected:', this._socket.id);
    });
    
    this._socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    this._socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  /**
   * Emit a socket event
   */
  emit(event: string, data: any): void {
    console.log('Emitting event:', event, data);
    this._socket.emit(event, data);
  }

  /**
   * Listen to a socket event
   */
  on(event: string): Observable<any> {
    if (!this._meetingEvents.has(event)) {
      const subject = new Subject<any>();
      this._meetingEvents.set(event, subject);
      
      this._socket.on(event, (data) => {
        console.log('📨 Received event:', event, data);
        this.zone.run(() => subject.next(data));
      });
    }
    
    return this._meetingEvents.get(event)!.asObservable();
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
