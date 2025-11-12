import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket!: Socket;
  private meetingEvents: Map<string, Subject<any>> = new Map();

  constructor(private zone: NgZone) {
    this.socket = io(environment.socketUrl, { 
      reconnection: true, 
      withCredentials: true, 
      transports: ['websocket', 'polling'] 
    });
    
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
    });
  }

  /**
   * Emit a socket event
   */
  emit(event: string, data: any): void {
    console.log('📤 Emitting event:', event, data);
    this.socket.emit(event, data);
  }

  /**
   * Listen to a socket event
   */
  on(event: string): Observable<any> {
    if (!this.meetingEvents.has(event)) {
      const subject = new Subject<any>();
      this.meetingEvents.set(event, subject);
      
      this.socket.on(event, (data) => {
        console.log('📨 Received event:', event, data);
        this.zone.run(() => subject.next(data));
      });
    }
    
    return this.meetingEvents.get(event)!.asObservable();
  }

  /**
   * Stop listening to a specific event
   */
  off(event: string): void {
    if (this.meetingEvents.has(event)) {
      this.socket.off(event);
      this.meetingEvents.get(event)?.complete();
      this.meetingEvents.delete(event);
    }
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    this.socket.disconnect();
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket.id;
  }
}
