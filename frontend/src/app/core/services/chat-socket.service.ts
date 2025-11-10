import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private socket!: Socket;
  private newMessage$ = new Subject<any>();
  private typing$ = new Subject<{ threadId: string; senderType: 'user' | 'trainer' }>();
  private read$ = new Subject<{ threadId: string; readerId: string; readerType: 'user' | 'trainer' }>();
  private delivered$ = new Subject<{ threadId: string }>();

  constructor(private zone: NgZone) {
    this.socket = io(environment.socketUrl, { reconnection: true, withCredentials: true, transports: ['websocket', 'polling'] });
    this.socket.on('chat:newMessage', (data) => this.zone.run(() => this.newMessage$.next(data)));
    this.socket.on('chat:typing', (data) => this.zone.run(() => this.typing$.next(data)));
    this.socket.on('chat:read', (data) => this.zone.run(() => this.read$.next(data)));
    this.socket.on('chat:delivered', (data) => this.zone.run(() => this.delivered$.next(data)));
  }

  // Join user/trainer room for notifications
  join(id: string, type: 'user' | 'trainer') {
    this.socket.emit('join', { id, type });
  }

  joinThread(threadId: string, userId: string, role: 'user' | 'trainer') {
    this.socket.emit('chat:joinThread', { threadId, userId, role });
  }

  sendMessage(threadId: string, senderId: string, senderType: 'user' | 'trainer', content: string) {
    this.socket.emit('chat:sendMessage', { threadId, senderId, senderType, content });
  }

  typing(threadId: string, senderType: 'user' | 'trainer') {
    this.socket.emit('chat:typing', { threadId, senderType });
  }

  markRead(threadId: string, readerId: string, readerType: 'user' | 'trainer') {
    this.socket.emit('chat:read', { threadId, readerId, readerType });
  }

  onNewMessage(): Observable<any> {
    return this.newMessage$.asObservable();
  }

  onTyping(): Observable<{ threadId: string; senderType: 'user' | 'trainer' }> {
    return this.typing$.asObservable();
  }

  onRead(): Observable<{ threadId: string; readerId: string; readerType: 'user' | 'trainer' }> {
    return this.read$.asObservable();
  }

  onDelivered(): Observable<{ threadId: string }> {
    return this.delivered$.asObservable();
  }
  
}