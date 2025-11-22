import { CommonModule, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Component, inject, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from "@angular/core";
import { Subject, takeUntil } from "rxjs";
import { ChatMessage, ChatService, ChatThread } from "../../../../core/services/chat.service";
import { ChatSocketService } from "../../../../core/services/chat-socket.service";
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';


@Component({
  selector: 'zenfit-trainer-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, ConfirmationDialogComponent],
  templateUrl: './trainer-chat.component.html',
  styleUrls: ['./trainer-chat.component.css'],
})
export class TrainerChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chat = inject(ChatService);
  private socket = inject(ChatSocketService);
  private toastr = inject(ToastrService);
  private destroy$ = new Subject<void>();

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private shouldScrollToBottom = false;

  threads: ChatThread[] = [];
  active: ChatThread | null = null;
  messages: ChatMessage[] = [];
  input = '';
  
  // Confirmation dialog state
  showDeleteConfirm = false;
  messageToDelete: string | null = null;

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
      // Update the active chat messages
      if (this.active && m.threadId === this.active._id) {
        this.messages.push(m);
        this.shouldScrollToBottom = true;
        // Auto-mark as read when message arrives
        if (m.senderType !== 'trainer') {
          this.chat.markRead(this.active._id).subscribe();
        }
      }
      
      // Update thread list in sidebar to show latest message
      const thread = this.threads.find(t => t._id === m.threadId);
      if (thread) {
        thread.lastMessage = m.content;
        thread.lastMessageAt = m.createdAt;
        // If message is not in active thread, increment unread count
        if (!this.active || this.active._id !== m.threadId) {
          if (m.senderType !== 'trainer') {
            thread.trainerUnread = (thread.trainerUnread || 0) + 1;
          }
        }
        // Move this thread to the top of the list
        this.threads = [thread, ...this.threads.filter(t => t._id !== m.threadId)];
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

    // Listen for message deletions
    this.socket.onMessageDeleted().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.messages = this.messages.filter(m => m._id !== data.messageId);
    });
  }

  select(t: ChatThread) {
    this.active = t;
    // Reset unread count for this thread
    t.trainerUnread = 0;
    // Extract trainer ID string from populated object or use as-is if string
    const trainerId = typeof t.trainerId === 'object' ? t.trainerId._id : t.trainerId;
    this.socket.joinThread(t._id, trainerId, 'trainer');
    this.chat.getMessages(t._id, 1, 50).subscribe((res: any) => {
      this.messages = res.data || [];
      this.shouldScrollToBottom = true;
    });
    // Mark as read
    this.chat.markRead(t._id).subscribe();
  }

  send() {
    if (!this.active || !this.input.trim()) return;
    const content = this.input.trim();
    this.input = '';
    this.shouldScrollToBottom = true;
    this.chat.sendMessage(this.active._id, content).subscribe(res => {
      // Message will be added via socket event
      console.log('Message sent:', res.data);
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }

  openDeleteConfirmation(messageId: string) {
    this.messageToDelete = messageId;
    this.showDeleteConfirm = true;
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.messageToDelete = null;
  }

  confirmDelete() {
    if (!this.messageToDelete) return;
    
    this.chat.deleteMessage(this.messageToDelete).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m._id !== this.messageToDelete);
        this.toastr.success('Message deleted successfully', 'Deleted');
        this.showDeleteConfirm = false;
        this.messageToDelete = null;
      },
      error: (err) => {
        console.error('Error deleting message:', err);
        this.toastr.error('Failed to delete message. Please try again.', 'Error');
        this.showDeleteConfirm = false;
        this.messageToDelete = null;
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
