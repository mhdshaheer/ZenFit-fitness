import { inject, Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private _socket!: Socket;
  private _logger = inject(LoggerService);
  private _newMessage$ = new Subject<any>();
  private _typing$ = new Subject<{ threadId: string; senderType: 'user' | 'trainer' }>();
  private _read$ = new Subject<{ threadId: string; readerId: string; readerType: 'user' | 'trainer' }>();
  private _delivered$ = new Subject<{ threadId: string }>();
  private _messageDeleted$ = new Subject<{ messageId: string }>();

  constructor(private _zone: NgZone) {
    this._socket = io(environment.socketUrl, { reconnection: true, withCredentials: true, transports: ['websocket', 'polling'] });
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
    // Chat events
    this._socket.on('chat:newMessage', (data) => {
      this._logger.info('Received new message:', data);
      this._zone.run(() => this._newMessage$.next(data));
    });
    this._socket.on('chat:typing', (data) => this._zone.run(() => this._typing$.next(data)));
    this._socket.on('chat:read', (data) => this._zone.run(() => this._read$.next(data)));
    this._socket.on('chat:delivered', (data) => this._zone.run(() => this._delivered$.next(data)));
    this._socket.on('chat:messageDeleted', (data) => this._zone.run(() => this._messageDeleted$.next(data)));
  }

  // Join user/trainer room for notifications
  join(id: string, type: 'user' | 'trainer') {
    this._socket.emit('join', { id, type });
  }

  joinThread(threadId: string, userId: string, role: 'user' | 'trainer') {
    this._logger.info('Joining thread:', { threadId, userId, role });
    this._socket.emit('chat:joinThread', { threadId, userId, role });
  }

  sendMessage(threadId: string, senderId: string, senderType: 'user' | 'trainer', content: string) {
    this._socket.emit('chat:sendMessage', { threadId, senderId, senderType, content });
  }

  typing(threadId: string, senderType: 'user' | 'trainer') {
    this._socket.emit('chat:typing', { threadId, senderType });
  }

  markRead(threadId: string, readerId: string, readerType: 'user' | 'trainer') {
    this._socket.emit('chat:read', { threadId, readerId, readerType });
  }

  onNewMessage(): Observable<any> {
    return this._newMessage$.asObservable();
  }

  onTyping(): Observable<{ threadId: string; senderType: 'user' | 'trainer' }> {
    return this._typing$.asObservable();
  }

  onRead(): Observable<{ threadId: string; readerId: string; readerType: 'user' | 'trainer' }> {
    return this._read$.asObservable();
  }

  onDelivered(): Observable<{ threadId: string }> {
    return this._delivered$.asObservable();
  }

  onMessageDeleted(): Observable<{ messageId: string }> {
    return this._messageDeleted$.asObservable();
  }
}