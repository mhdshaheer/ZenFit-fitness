import { CommonModule, DatePipe, NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { ChatMessage, ChatService, ChatThread } from "../../../../core/services/chat.service";
import { ChatSocketService } from "../../../../core/services/chat-socket.service";


@Component({
  selector: 'zenfit-trainer-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass, DatePipe],
  templateUrl: './trainer-chat.component.html',
  styleUrls: ['./trainer-chat.component.css'],
})
export class TrainerChatComponent implements OnInit, OnDestroy {
  private chat = inject(ChatService);
  private socket = inject(ChatSocketService);
  private destroy$ = new Subject<void>();

  threads: ChatThread[] = [];
  active: ChatThread | null = null;
  messages: ChatMessage[] = [];
  input = '';

  ngOnInit(): void {
    // Fetch trainer's chat threads
    this.chat.getTrainerThreads().pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      this.threads = res.data || [];
      if (this.threads.length) {
        this.select(this.threads[0]);
        // Join trainer room for notifications
        this.socket.join(this.threads[0].trainerId as any, 'trainer');
      }
    });

    // Listen for incoming messages
    this.socket.onNewMessage().pipe(takeUntil(this.destroy$)).subscribe((m: any) => {
      if (this.active && m.threadId === this.active._id) {
        this.messages.push(m);
        // Auto-mark as read when message arrives
        if (m.senderType !== 'trainer') {
          this.chat.markRead(this.active._id).subscribe();
        }
      }
    });

    // Listen for delivered notifications
    this.socket.onDelivered().pipe(takeUntil(this.destroy$)).subscribe(data => {
      console.log('Message delivered to thread:', data.threadId);
      // Update thread list to show new message indicator
      const thread = this.threads.find(t => t._id === data.threadId);
      if (thread && (!this.active || this.active._id !== data.threadId)) {
        // Refresh threads to get updated unread count
        this.chat.getTrainerThreads().subscribe((res: any) => {
          this.threads = res.data || [];
        });
      }
    });
  }

  select(t: ChatThread) {
    this.active = t;
    this.socket.joinThread(t._id, t.trainerId as any, 'trainer');
    this.chat.getMessages(t._id, 1, 50).subscribe((res: any) => {
      this.messages = res.data || [];
    });
  }

  send() {
    if (!this.active || !this.input.trim()) return;
    const content = this.input.trim();
    this.input = '';
    this.chat.sendMessage(this.active._id, content).subscribe(res => {
      // Message will be added via socket event
      console.log('Message sent:', res.data);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
