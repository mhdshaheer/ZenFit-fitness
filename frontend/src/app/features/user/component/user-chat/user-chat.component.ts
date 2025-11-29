import { CommonModule } from "@angular/common";
import { Component, inject, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { ChatMessage, ChatService, ChatThread } from "../../../../core/services/chat.service";
import { ChatSocketService } from "../../../../core/services/chat-socket.service";
import { Subject, takeUntil } from "rxjs";
import { ToastrService } from 'ngx-toastr';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { LoggerService } from "../../../../core/services/logger.service";

@Component({
  selector: 'zenfit-user-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmationDialogComponent],
  templateUrl: './user-chat.component.html',
  styleUrls: ['./user-chat.component.css'],
})
export class UserChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private route = inject(ActivatedRoute);
  private chat = inject(ChatService);
  private socket = inject(ChatSocketService);
  private toastr = inject(ToastrService);
  private destroy$ = new Subject<void>();
  private _logger = inject(LoggerService)

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  private shouldScrollToBottom = false;

  thread: ChatThread | null = null;
  messages: ChatMessage[] = [];
  input = '';
  
  // Confirmation dialog state
  showDeleteConfirm = false;
  messageToDelete: string | null = null;

  ngOnInit(): void {
    const programId = this.route.snapshot.paramMap.get('programId')!;
    this.chat.initThread(programId).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.thread = res.data;
      const userId = typeof this.thread.userId === 'object' ? this.thread.userId._id : this.thread.userId;
      this.socket.join(userId, 'user');
      this.socket.joinThread(this.thread._id, userId, 'user');
      this.loadMessages(this.thread._id);
    });

    this.socket.onNewMessage().pipe(takeUntil(this.destroy$)).subscribe(m => {
      if (m.threadId === this.thread?._id) {
        this.messages.push(m);
        this.shouldScrollToBottom = true;
        if (m.senderType !== 'user' && this.thread) {
          this.chat.markRead(this.thread._id).subscribe();
        }
      }
    });

    this.socket.onDelivered().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this._logger.info('Message delivered to thread:', data.threadId);
    });

    // Listen for message deletions
    this.socket.onMessageDeleted().pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.messages = this.messages.filter(m => m._id !== data.messageId);
    });
  }

  loadMessages(threadId: string) {
    this.chat.getMessages(threadId, 1, 50).pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.messages = res.data;
      this.shouldScrollToBottom = true;
    });
  }

  send() {
    if (!this.thread || !this.input.trim()) return;
    const content = this.input.trim();
    this.input = '';
    this.shouldScrollToBottom = true;
    this.chat.sendMessage(this.thread._id, content).subscribe(res => {
      // Message will be added via socket event
      this._logger.info('Message sent:', res.data);
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
      this._logger.error('Scroll to bottom failed:', err);
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
        this._logger.error('Error deleting message:', err);
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