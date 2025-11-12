import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BookingService, TrainerSession } from '../../../../core/services/booking.service';
import { MeetingService } from '../../../../core/services/meeting.service';
import { MeetingRoomComponent } from '../../../../shared/components/meeting-room/meeting-room.component';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'zenfit-trainer-sessions',
  standalone: true,
  imports: [CommonModule, MeetingRoomComponent],
  templateUrl: './trainer-sessions.component.html',
  styleUrl: './trainer-sessions.component.css'
})
export class TrainerSessionsComponent implements OnInit, OnDestroy {
  private readonly _bookingService = inject(BookingService);
  private readonly _meetingService = inject(MeetingService);
  private readonly _toastService = inject(ToastService);
  private readonly _destroy$ = new Subject<void>();

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
          console.log('Fetched sessions:', sessions);
          this.processSessions(sessions);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading sessions:', error);
          console.error('Error details:', {
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
      console.log('🎥 Starting meeting for session:', session);

      // Create meeting
      const response = await this._meetingService.createMeeting(session.slotId).toPromise();
      
      if (response?.meetingId) {
        this.currentMeetingId = response.meetingId;
        this.currentMeetingSlotId = session.slotId;
        this.currentMeetingTitle = `${session.programName} - ${this.formatDate(session.date)}`;
        this.showMeetingRoom = true;
        this._toastService.success('Meeting started successfully!');
        console.log('✅ Meeting created:', response.meetingId);
      }
    } catch (error) {
      console.error('❌ Error starting meeting:', error);
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
}
