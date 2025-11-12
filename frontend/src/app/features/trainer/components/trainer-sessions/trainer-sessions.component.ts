import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BookingService, TrainerSession } from '../../../../core/services/booking.service';

@Component({
  selector: 'zenfit-trainer-sessions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trainer-sessions.component.html',
  styleUrl: './trainer-sessions.component.css'
})
export class TrainerSessionsComponent implements OnInit, OnDestroy {
  private readonly _bookingService = inject(BookingService);
  private readonly _destroy$ = new Subject<void>();

  sessions: TrainerSession[] = [];
  upcomingSessions: TrainerSession[] = [];
  pastSessions: TrainerSession[] = [];
  isLoading = true;
  activeTab: 'upcoming' | 'past' = 'upcoming';
  
  // Modal state
  showStudentsModal = false;
  selectedSession: TrainerSession | null = null;

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

  startMeeting(session: TrainerSession): void {
    console.log('🎥 Start meeting for session:', session);
    // TODO: Implement meeting functionality
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
