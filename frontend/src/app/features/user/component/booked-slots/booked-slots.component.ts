import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { BookingService, BookedSlot } from '../../../../core/services/booking.service';
import { MeetingService } from '../../../../core/services/meeting.service';
import { MeetingRoomComponent } from '../../../../shared/components/meeting-room/meeting-room.component';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';
import { ProgramService } from '../../../../core/services/program.service';
import { Program } from '../../../trainer/store/trainer.model';

interface SlotWithProgram extends BookedSlot {
  programName?: string;
  programDuration?: string;
  programDifficulty?: string;
  isUpcoming?: boolean;
}

@Component({
  selector: 'zenfit-booked-slots',
  imports: [CommonModule, MeetingRoomComponent],
  templateUrl: './booked-slots.component.html',
  styleUrl: './booked-slots.component.css'
})
export class BookedSlotsComponent implements OnInit, OnDestroy {
  private readonly _bookingService = inject(BookingService);
  private readonly _meetingService = inject(MeetingService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _programService = inject(ProgramService);
  private readonly _destroy$ = new Subject<void>();

  upcomingSlots: SlotWithProgram[] = [];
  pastSlots: SlotWithProgram[] = [];
  activeTab: 'upcoming' | 'past' = 'upcoming';
  isLoading = true;

  // Meeting state
  showMeetingRoom = false;
  currentMeetingId: string | null = null;
  currentMeetingSlotId: string | null = null;
  currentMeetingTitle: string = '';
  isJoiningMeeting = false;
  joiningSlotId: string | null = null;

  ngOnInit(): void {
    this.loadBookedSlots();
  }

  loadBookedSlots(): void {
    this._bookingService.getMyBookings()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (slots) => {
          if (slots.length === 0) {
            this.upcomingSlots = [];
            this.pastSlots = [];
            this.isLoading = false;
            return;
          }

          // Get unique program IDs
          const uniqueProgramIds = [...new Set(slots.map(slot => slot.programId))];

          // Fetch all program details
          const programRequests = uniqueProgramIds.map(programId =>
            this._programService.getProgramByProgramId(programId)
          );

          forkJoin(programRequests)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
              next: (programs) => {
                // Create a map of programId to program details
                const programMap = new Map<string, Program>();
                programs.forEach((program, index) => {
                  programMap.set(uniqueProgramIds[index], program);
                });

                const now = new Date();
                const upcoming: SlotWithProgram[] = [];
                const past: SlotWithProgram[] = [];

                slots.forEach(slot => {
                  const slotDateTime = new Date(slot.date);
                  const program = programMap.get(slot.programId);

                  const slotWithProgram: SlotWithProgram = {
                    ...slot,
                    programName: program?.title || 'Fitness Program',
                    programDuration: program?.duration || 'N/A',
                    programDifficulty: program?.difficultyLevel || 'Beginner',
                    isUpcoming: slotDateTime >= now
                  };

                  if (slotDateTime >= now) {
                    upcoming.push(slotWithProgram);
                  } else {
                    past.push(slotWithProgram);
                  }
                });

                // Sort upcoming by date ascending (nearest first)
                this.upcomingSlots = upcoming.sort((a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
                );

                // Sort past by date descending (most recent first)
                this.pastSlots = past.sort((a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                this.isLoading = false;
              },
              error: (error) => {
                console.error('Error loading program details:', error);
                // Fallback: show slots without program details
                this.loadSlotsWithoutProgramDetails(slots);
              }
            });
        },
        error: (error) => {
          console.error('Error loading booked slots:', error);
          this.isLoading = false;
        }
      });
  }

  private loadSlotsWithoutProgramDetails(slots: BookedSlot[]): void {
    const now = new Date();
    const upcoming: SlotWithProgram[] = [];
    const past: SlotWithProgram[] = [];

    slots.forEach(slot => {
      const slotDateTime = new Date(slot.date);
      const slotWithProgram: SlotWithProgram = {
        ...slot,
        programName: 'Fitness Program',
        programDuration: 'N/A',
        programDifficulty: 'Beginner',
        isUpcoming: slotDateTime >= now
      };

      if (slotDateTime >= now) {
        upcoming.push(slotWithProgram);
      } else {
        past.push(slotWithProgram);
      }
    });

    // Sort upcoming by date ascending (nearest first)
    this.upcomingSlots = upcoming.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Sort past by date descending (most recent first)
    this.pastSlots = past.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.isLoading = false;
  }

  switchTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
  }

  async joinMeeting(slot: SlotWithProgram): Promise<void> {
    if (this.isJoiningMeeting) return;

    try {
      this.isJoiningMeeting = true;
      this.joiningSlotId = slot.slotId;
      console.log('🎥 Joining meeting for slot:', slot);

      // Validate access first
      const validation = await this._meetingService.validateMeetingAccess(slot.slotId, slot._id).toPromise();

      if (!validation?.isValid || !validation?.canJoin) {
        this._toastService.warning(validation?.message || 'You cannot join this meeting. The meeting may not have started yet.');
        return;
      }

      // Join the meeting
      if (validation.meetingId) {
        const meetingSession = await this._meetingService.joinMeeting(validation.meetingId, slot.slotId).toPromise();

        if (meetingSession) {
          this.currentMeetingId = validation.meetingId;
          this.currentMeetingSlotId = slot.slotId;
          this.currentMeetingTitle = `${slot.programName || 'Training Session'} - ${this.formatDate(slot.date)}`;
          this.showMeetingRoom = true;
          this._toastService.success('Successfully joined the meeting!');
          console.log('✅ Joined meeting:', validation.meetingId);
        }
      }
    } catch (error: any) {
      console.error('❌ Error joining meeting:', error);
      const message = error?.error?.message || 'Failed to join meeting. Please try again or contact the trainer.';
      this._toastService.error(message);
    } finally {
      this.isJoiningMeeting = false;
      this.joiningSlotId = null;
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

  formatTime(time: string): string {
    return time;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  }

  getDifficultyColor(difficulty?: string, muted: boolean = false): string {
    if (muted) {
      // Muted colors for past sessions
      switch (difficulty) {
        case 'Beginner':
          return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        case 'Intermediate':
          return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        case 'Advanced':
          return 'bg-neutral-100 text-neutral-600 border-neutral-200';
        default:
          return 'bg-neutral-100 text-neutral-600 border-neutral-200';
      }
    }

    // Vibrant colors for upcoming sessions
    switch (difficulty) {
      case 'Beginner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
