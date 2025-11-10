import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ChatMessage, ChatService, ChatThread } from "../../../../core/services/chat.service";
import { ChatSocketService } from "../../../../core/services/chat-socket.service";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: 'zenfit-user-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.css'],
})
export class UserChatComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private chat = inject(ChatService);
  private socket = inject(ChatSocketService);
  private destroy$ = new Subject<void>();

  thread: ChatThread | null = null;
  messages: ChatMessage[] = [];
  input = '';

  ngOnInit(): void {
    const programId = this.route.snapshot.paramMap.get('programId')!;
    this.chat.initThread(programId).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.thread = res.data;
      // Join user room for notifications
      this.socket.join(this.thread.userId as any, 'user');
      // Join thread room for messages
      this.socket.joinThread(this.thread._id, this.thread.userId as any, 'user');
      this.loadMessages(this.thread._id);
    });

    // Listen for new messages
    this.socket.onNewMessage().pipe(takeUntil(this.destroy$)).subscribe(m => {
      if (m.threadId === this.thread?._id) {
        this.messages.push(m);
        // Auto-mark as read when message arrives
        if (m.senderType !== 'user' && this.thread) {
          this.chat.markRead(this.thread._id).subscribe();
        }
      }
    });

    // Listen for delivered notifications
    this.socket.onDelivered().pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log('Message delivered to thread:', data.threadId);
    });
  }

  loadMessages(threadId: string) {
    this.chat.getMessages(threadId, 1, 50).pipe(takeUntil(this.destroy$)).subscribe(res => this.messages = res.data);
  }

  send() {
    if (!this.thread || !this.input.trim()) return;
    const content = this.input.trim();
    this.input = '';
    this.chat.sendMessage(this.thread._id, content).subscribe(res => {
      // Message will be added via socket event
      console.log('Message sent:', res.data);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}