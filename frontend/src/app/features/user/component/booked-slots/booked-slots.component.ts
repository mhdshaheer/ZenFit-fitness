import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, forkJoin, switchMap, filter } from 'rxjs';
import { BookingService, BookedSlot } from '../../../../core/services/booking.service';
import { MeetingService } from '../../../../core/services/meeting.service';
import { MeetingRoomComponent } from '../../../../shared/components/meeting-room/meeting-room.component';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';
import { ProgramService } from '../../../../core/services/program.service';
import { Program } from '../../../trainer/store/trainer.model';
import { LoggerService } from '../../../../core/services/logger.service';
import { NotificationSocketService } from '../../../../core/services/notificationSocket.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { INotification } from '../../../../interface/notification.interface';

interface SlotWithProgram extends BookedSlot {
  programName?: string;
  programDuration?: string;
  programDifficulty?: string;
  isUpcoming?: boolean;
}

type ProgramIdentifier = string | { toString(): string } | null | undefined;

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
  private readonly _notificationSocket = inject(NotificationSocketService);
  private readonly _profileService = inject(ProfileService);
  private readonly _destroy$ = new Subject<void>();
  private _logger = inject(LoggerService)
  private readonly _defaultTimezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

  upcomingSlots: SlotWithProgram[] = [];
  pastSlots: SlotWithProgram[] = [];
  cancelledSlots: SlotWithProgram[] = [];
  activeTab: 'upcoming' | 'past' | 'cancelled' = 'upcoming';
  isLoading = true;

  // Meeting state
  showMeetingRoom = false;
  currentMeetingId: string | null = null;
  currentMeetingSlotId: string | null = null;
  currentMeetingTitle: string = '';
  isJoiningMeeting = false;
  joiningSlotId: string | null = null;
  private notificationListenerInitialized = false;

  ngOnInit(): void {
    this.loadBookedSlots();
    this.initializeNotificationListener();
  }

  private initializeNotificationListener(): void {
    if (this.notificationListenerInitialized) {
      return;
    }
    this.notificationListenerInitialized = true;

    this._profileService
      .getCurrentUserId()
      .pipe(
        takeUntil(this._destroy$),
        switchMap((user) => {
          if (!user?.id) {
            return [] as unknown as ReturnType<typeof this._notificationSocket.getNotifications$>;
          }

          const role = (user.role === 'trainer' || user.role === 'admin') ? user.role : 'user';
          this._notificationSocket.joinRoom(user.id, role as 'user' | 'trainer' | 'admin');

          return this._notificationSocket
            .getNotifications$()
            .pipe(
              filter((notification): notification is INotification => Boolean(notification)),
              filter((notification) => notification.receiverId === user.id)
            );
        })
      )
      .subscribe({
        next: (notification) => {
          if (!notification) {
            return;
          }

          const combinedText = `${notification.title ?? ''} ${notification.message ?? ''}`.toLowerCase();
          const isCancellation = combinedText.includes('cancel');

          if (!isCancellation) {
            return;
          }

          const message = notification.message ?? 'A booked session was cancelled by your trainer.';
          this._toastService.warning(message, 4000);
          this.loadBookedSlots();
        },
        error: (error) => {
          this._logger.error('Notification listener error:', error);
        }
      });
  }

  private normalizeSlot(slot: BookedSlot): BookedSlot {
    const snapshot = (slot as any)?.snapshot ?? {};
    const normalizedProgramId = this.resolveProgramId(slot, snapshot);
    const timezone = this.resolveTimezone(snapshot?.timezone, (slot as any)?.timezone);
    const slotDate = snapshot?.slotDate ?? slot.date;
    const normalizedStart = snapshot?.startTime ?? slot.startTime;
    const normalizedEnd = snapshot?.endTime ?? slot.endTime;
    const normalizedDate = this.normalizeDateForTimezone(slotDate, timezone);
    const normalizedDay = this.getDayLabel(normalizedDate);

    return {
      ...slot,
      programId: normalizedProgramId ?? '',
      date: normalizedDate,
      day: normalizedDay,
      startTime: normalizedStart,
      endTime: normalizedEnd,
      snapshot: {
        ...snapshot,
        slotDate: normalizedDate,
        timezone,
      },
    } as BookedSlot;
  }

  private resolveProgramId(slot: BookedSlot, snapshot: any): string | null {
    const rawProgramId: ProgramIdentifier = (slot as any)?.programId ?? snapshot?.programId;
    if (!rawProgramId) return null;

    if (typeof rawProgramId === 'string') {
      return rawProgramId.trim().length ? rawProgramId : null;
    }

    if (typeof rawProgramId === 'object' && typeof rawProgramId.toString === 'function') {
      const converted = rawProgramId.toString();
      return converted.trim().length ? converted : null;
    }

    return null;
  }

  private resolveTimezone(...timezones: Array<string | undefined | null>): string {
    for (const zone of timezones) {
      if (zone && zone.trim().length) {
        return zone;
      }
    }
    return this._defaultTimezone;
  }

  private normalizeDateForTimezone(
    dateInput: Date | string | undefined,
    timezone?: string
  ): Date {
    if (!dateInput) {
      return new Date();
    }

    const rawDate = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (Number.isNaN(rawDate.getTime())) {
      return new Date();
    }

    const safeTimezone = timezone ?? this._defaultTimezone;

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: safeTimezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
      const parts = formatter.formatToParts(rawDate);
      const year = Number(
        parts.find((part) => part.type === 'year')?.value ?? rawDate.getUTCFullYear()
      );
      const month = Number(
        parts.find((part) => part.type === 'month')?.value ?? rawDate.getUTCMonth() + 1
      );
      const day = Number(
        parts.find((part) => part.type === 'day')?.value ?? rawDate.getUTCDate()
      );
      return new Date(year, month - 1, day);
    } catch {
      return new Date(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate());
    }
  }

  private getDayLabel(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }

  loadBookedSlots(): void {
    this._bookingService.getMyBookings()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (slots) => {
          const normalizedSlots = slots.map((slot) => this.normalizeSlot(slot));

          if (normalizedSlots.length === 0) {
            this.upcomingSlots = [];
            this.pastSlots = [];
            this.isLoading = false;
            return;
          }

          if (slots.length === 0) {
            this.upcomingSlots = [];
            this.pastSlots = [];
            this.isLoading = false;
            return;
          }

          const uniqueProgramIds = [...new Set(
            normalizedSlots
              .map(slot => slot.programId)
              .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
          )];

          if (uniqueProgramIds.length === 0) {
            this.processSlots(normalizedSlots);
            return;
          }

          const programRequests = uniqueProgramIds.map(programId =>
            this._programService.getProgramByProgramId(programId)
          );

          forkJoin(programRequests)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
              next: (programs) => {
                const programMap = new Map<string, Program>();
                programs.forEach((program, index) => {
                  programMap.set(uniqueProgramIds[index], program);
                });
                this.processSlots(normalizedSlots, programMap);
              },
              error: (error) => {
                this._logger.error('Error loading program details:', error);
                this.processSlots(normalizedSlots);
              }
            });
        },
        error: (error) => {
          this._logger.error('Error loading booked slots:', error);
          this.isLoading = false;
        }
      });
  }

  private processSlots(slots: BookedSlot[], programMap: Map<string, Program> = new Map()): void {
    const now = new Date();
    const upcoming: SlotWithProgram[] = [];
    const past: SlotWithProgram[] = [];
    const cancelled: SlotWithProgram[] = [];

    slots.forEach(slot => {
      const slotDateTime = new Date(slot.date);
      const program = slot.programId ? programMap.get(slot.programId) : undefined;
      const slotWithProgram: SlotWithProgram = {
        ...slot,
        programName: program?.title || 'Fitness Program',
        programDuration: program?.duration || 'N/A',
        programDifficulty: program?.difficultyLevel || 'Beginner',
        isUpcoming: slotDateTime >= now
      };

      if (slot.status === 'cancelled') {
        cancelled.push(slotWithProgram);
        return;
      }

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

    // Sort cancelled by latest first
    this.cancelledSlots = cancelled.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    this.isLoading = false;
  }

  switchTab(tab: 'upcoming' | 'past' | 'cancelled'): void {
    this.activeTab = tab;
  }

  async joinMeeting(slot: SlotWithProgram): Promise<void> {
    if (this.isJoiningMeeting) return;

    try {
      this.isJoiningMeeting = true;
      this.joiningSlotId = slot.slotId;
      this._logger.info('Joining meeting for slot:', slot);

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
          this._logger.info('Joined meeting:', validation.meetingId);
        }
      }
    } catch (error: any) {
      this._logger.error('Error joining meeting:', error);
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
    if (!time) return '';
    const [hourStr, minuteStr] = time.split(':');
    const hours = Number(hourStr);
    const minutes = Number(minuteStr ?? '0');
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return time;
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const normalizedHour = hours % 12 === 0 ? 12 : hours % 12;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${normalizedHour}:${paddedMinutes} ${period}`;
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
