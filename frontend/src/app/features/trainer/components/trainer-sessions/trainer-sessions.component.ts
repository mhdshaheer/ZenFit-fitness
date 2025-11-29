import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { BookingService, TrainerSession } from '../../../../core/services/booking.service';
import { MeetingService } from '../../../../core/services/meeting.service';
import { MeetingRoomComponent } from '../../../../shared/components/meeting-room/meeting-room.component';
import { ToastService } from '../../../../core/services/toast.service';
import { FeedbackService } from '../../../../core/services/feedback.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'zenfit-trainer-sessions',
  standalone: true,
  imports: [CommonModule, MeetingRoomComponent, FormsModule],
  templateUrl: './trainer-sessions.component.html',
  styleUrl: './trainer-sessions.component.css'
})
export class TrainerSessionsComponent implements OnInit, OnDestroy {
  private readonly _bookingService = inject(BookingService);
  private readonly _meetingService = inject(MeetingService);
  private readonly _toastService = inject(ToastService);
  private readonly _feedbackService = inject(FeedbackService);
  private readonly _destroy$ = new Subject<void>();
  private _logger = inject(LoggerService)

  sessions: TrainerSession[] = [];
  upcomingSessions: TrainerSession[] = [];
  pastSessions: TrainerSession[] = [];
  isLoading = true;
  activeTab: 'upcoming' | 'past' = 'upcoming';
  
  // Modal state
  showStudentsModal = false;
  selectedSession: TrainerSession | null = null;
  
  // Meeting state
  showMeetingRoom = false;
  currentMeetingId: string | null = null;
  currentMeetingSlotId: string | null = null;
  currentMeetingTitle: string = '';
  isStartingMeeting = false;

  // Feedback modal state
  showFeedbackModal = false;
  feedbackText = '';
  selectedFeedbackSession: TrainerSession | null = null;
  isSubmittingFeedback = false;
  existingFeedback: string | null = null;

  ngOnInit(): void {
    this.loadSessions();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  loadSessions(): void {
    this.isLoading = true;
    
    this._bookingService.getTrainerSessions()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (sessions) => {
          this.processSessions(sessions);
          this.isLoading = false;
        },
        error: (error) => {
          this._logger.error('Error loading sessions:', error);
          this._logger.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          this.isLoading = false;
        }
      });
  }

  processSessions(sessions: TrainerSession[]): void {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    this.upcomingSessions = sessions
      .filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    this.pastSessions = sessions
      .filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate < now;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  setActiveTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
  }

  viewBookedUsers(session: TrainerSession): void {
    this.selectedSession = session;
    this.showStudentsModal = true;
  }

  closeStudentsModal(): void {
    this.showStudentsModal = false;
    this.selectedSession = null;
  }

  async startMeeting(session: TrainerSession): Promise<void> {
    if (this.isStartingMeeting) return;
    
    try {
      this.isStartingMeeting = true;
      this._logger.info('Starting meeting for session:', session);

      // Create meeting
      const response = await this._meetingService.createMeeting(session.slotId).toPromise();
      
      if (response?.meetingId) {
        this.currentMeetingId = response.meetingId;
        this.currentMeetingSlotId = session.slotId;
        this.currentMeetingTitle = `${session.programName} - ${this.formatDate(session.date)}`;
        this.showMeetingRoom = true;
        this._toastService.success('Meeting started successfully!');
        this._logger.info('Meeting created:', response.meetingId);
      }
    } catch (error) {
      this._logger.error('❌ Error starting meeting:', error);
      this._toastService.error('Failed to start meeting. Please try again.');
    } finally {
      this.isStartingMeeting = false;
    }
  }

  closeMeetingRoom(): void {
    this.showMeetingRoom = false;
    this.currentMeetingId = null;
    this.currentMeetingSlotId = null;
    this.currentMeetingTitle = '';
    this._meetingService.cleanup();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDifficultyColor(level: string): string {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'difficulty-beginner';
      case 'intermediate':
        return 'difficulty-intermediate';
      case 'advanced':
        return 'difficulty-advanced';
      default:
        return 'difficulty-beginner';
    }
  }

  // Feedback methods
  async openFeedbackModal(session: TrainerSession): Promise<void> {
    this.selectedFeedbackSession = session;
    this.feedbackText = '';
    this.existingFeedback = null;

    // Load existing feedback if any
    try {
      const feedback = await firstValueFrom(
        this._feedbackService.getFeedbackBySlotAndDate(
          session.slotId,
          session.date
        )
      );
      
      if (feedback) {
        this.feedbackText = feedback.feedback;
        this.existingFeedback = feedback.feedback;
      }
    } catch (error) {
      this._logger.error('Error loading existing feedback:', error);
    }

    this.showFeedbackModal = true;
  }

  closeFeedbackModal(): void {
    this.showFeedbackModal = false;
    this.selectedFeedbackSession = null;
    this.feedbackText = '';
    this.existingFeedback = null;
  }

  async submitFeedback(): Promise<void> {
    if (!this.selectedFeedbackSession || !this.feedbackText.trim()) {
      this._toastService.warning('Please enter feedback before submitting.');
      return;
    }

    this.isSubmittingFeedback = true;

    try {
      await firstValueFrom(
        this._feedbackService.createOrUpdateFeedback({
          slotId: this.selectedFeedbackSession.slotId,
          sessionDate: this.selectedFeedbackSession.date,
          feedback: this.feedbackText.trim()
        })
      );

      const action = this.existingFeedback ? 'updated' : 'submitted';
      this._toastService.success(`Feedback ${action} successfully!`);
      this.closeFeedbackModal();
    } catch (error) {
      this._logger.error('Error submitting feedback:', error);
      this._toastService.error('Failed to submit feedback. Please try again.');
    } finally {
      this.isSubmittingFeedback = false;
    }
  }
}
