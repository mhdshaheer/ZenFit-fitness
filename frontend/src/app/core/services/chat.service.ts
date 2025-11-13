import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";


export interface UserProfile {
  _id: string;
  fullName: string;
  username: string;
  profileImage?: string;
}

export interface ChatThread {
  _id: string;
  userId: string | UserProfile;
  trainerId: string | UserProfile;
  programId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  userUnread: number;
  trainerUnread: number;
}

export interface ChatMessage {
  _id: string;
  threadId: string;
  senderId: string | UserProfile;
  senderType: 'user' | 'trainer';
  content: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';    
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private _http = inject(HttpClient);
  private _api = `${environment.apiUrl}/chat`;

  initThread(programId: string): Observable<{ success: boolean; data: ChatThread }> {
    return this._http.post<{ success: boolean; data: ChatThread }>(`${this._api}/init/${programId}`, {});
  }

  getThreads(): Observable<{ success: boolean; data: ChatThread[] }> {
    return this._http.get<{ success: boolean; data: ChatThread[] }>(`${this._api}/threads`);
  }

  getTrainerThreads(): Observable<{ success: boolean; data: ChatThread[] }> {
    return this._http.get<{ success: boolean; data: ChatThread[] }>(`${this._api}/trainer/threads`);
  }

  getMessages(threadId: string, page = 1, limit = 50): Observable<{ success: boolean; data: ChatMessage[] }> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this._http.get<{ success: boolean; data: ChatMessage[] }>(`${this._api}/${threadId}/messages`, { params });
  }

  markRead(threadId: string): Observable<{ success: boolean }> {
    return this._http.post<{ success: boolean }>(`${this._api}/${threadId}/read`, {});
  }

  sendMessage(threadId: string, content: string): Observable<{ success: boolean; data: ChatMessage }> {
    return this._http.post<{ success: boolean; data: ChatMessage }>(`${this._api}/${threadId}/message`, { content });
  }

  deleteMessage(messageId: string): Observable<{ success: boolean; message: string }> {
    return this._http.delete<{ success: boolean; message: string }>(`${this._api}/message/${messageId}`);
  }
}