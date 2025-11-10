import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";


export interface ChatThread {
  _id: string;
  userId: string;
  trainerId: string;
  programId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  userUnread: number;
  trainerUnread: number;
}

export interface ChatMessage {
  _id: string;
  threadId: string;
  senderId: string;
  senderType: 'user' | 'trainer';
  content: string;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';    
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/chat`;

  initThread(programId: string): Observable<{ success: boolean; data: ChatThread }> {
    return this.http.post<{ success: boolean; data: ChatThread }>(`${this.api}/init/${programId}`, {});
  }

  getThreads(): Observable<{ success: boolean; data: ChatThread[] }> {
    return this.http.get<{ success: boolean; data: ChatThread[] }>(`${this.api}/threads`);
  }

  getTrainerThreads(): Observable<{ success: boolean; data: ChatThread[] }> {
    return this.http.get<{ success: boolean; data: ChatThread[] }>(`${this.api}/trainer/threads`);
  }

  getMessages(threadId: string, page = 1, limit = 50): Observable<{ success: boolean; data: ChatMessage[] }> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    return this.http.get<{ success: boolean; data: ChatMessage[] }>(`${this.api}/${threadId}/messages`, { params });
  }

  markRead(threadId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.api}/${threadId}/read`, {});
  }

  sendMessage(threadId: string, content: string): Observable<{ success: boolean; data: ChatMessage }> {
    return this.http.post<{ success: boolean; data: ChatMessage }>(`${this.api}/${threadId}/message`, { content });
  }
}