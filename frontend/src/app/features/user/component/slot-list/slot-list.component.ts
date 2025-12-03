import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ISlotInstancePaginatedResponse,
  ISlotInstancePaginationMeta,
  ISlotInstancePublic,
} from '../../../../interface/slot.interface';
import { SlotService } from '../../../../core/services/slot.service';
import { Subject, takeUntil } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger.service';
import { BookingService } from '../../../../core/services/booking.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ProgramService } from '../../../../core/services/program.service';

interface Program {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
}

interface SlotOccurrence {
  slotInstanceId: string;
  date: Date;
  dayName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  capacity: number;
  availableCapacity: number;
  booked: number;
  timezone: string;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  isBooked: boolean;
  isPast: boolean;
  isAvailable: boolean;
}

interface DayGroup {
  date: Date;
  dayName: string;
  dayOfWeek: string;
  dayNumber: number;
  month: string;
  year: number;
  isToday: boolean;
  occurrences: SlotOccurrence[];
}

interface ZonedDateInfo {
  dateKey: string;
  date: Date;
  components: {
    year: number;
    month: number;
    day: number;
  };
  offsetMinutes: number;
}

@Component({
  selector: 'zenfit-slot-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './slot-list.component.html',
  styleUrl: './slot-list.component.css',
})
export class SlotListComponent implements OnDestroy {
  private readonly _authService = inject(AuthService);
  private readonly _slotService = inject(SlotService);
  private readonly _programService = inject(ProgramService);
  private readonly _bookingService = inject(BookingService);
  private readonly _destroy$ = new Subject<void>();
  private readonly _loggerService = inject(LoggerService);
  private readonly _toastService = inject(ToastService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  program = signal<Program | null>(null);
  slotInstances = signal<ISlotInstancePublic[]>([]);
  pagination = signal<ISlotInstancePaginationMeta | null>(null);
  dayGroups = signal<DayGroup[]>([]);
  selectedOccurrence = signal<SlotOccurrence | null>(null);
  showBookingModal = signal(false);
  showSuccessModal = signal(false);
  isLoading = signal(true);
  selectedDayFilter = signal<string>('all');
  currentUserId!: string;
  bookedSlotIds = signal<Set<string>>(new Set());

  daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  daysToGenerate = 14;
  private readonly _slotFetchLimit = 200;

  // Computed properties
  filteredDayGroups = computed(() => {
    const filter = this.selectedDayFilter();
    if (filter === 'all') return this.dayGroups();
    return this.dayGroups().filter(
      (group) => group.dayOfWeek === filter && group.occurrences.length > 0
    );
  });

  availableSlotCount = computed(() => {
    return this.dayGroups()
      .flatMap((group) => group.occurrences)
      .filter((occ) => occ.isAvailable && !occ.isPast && !occ.isBooked).length;
  });

  ngOnInit(): void {
    const programId = this._activatedRoute.snapshot.paramMap.get('programId');
    if (programId) {
      this.getUserId();
      this.loadSlots(programId);
      this.loadProgram(programId);
      this.loadUserBookings();
    }
  }
  getUserId() {
    this._authService
      .getUserId()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.currentUserId = res.userId;
        },
      });
  }

  private loadUserBookings(): void {
    this._bookingService
      .getMyBookings()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (bookings) => {
          const slotIds = new Set(
            (bookings || [])
              .filter((booking) => booking.status !== 'cancelled')
              .map((booking) => booking.slotId)
          );
          this.bookedSlotIds.set(slotIds);
          this.generateDayGroups();
        },
        error: (err) => {
          this._loggerService.warn('Failed to load user bookings', err);
        },
      });
  }

  loadProgram(programId: string): void {
    this._programService
      .getProgramByProgramId(programId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          const category = JSON.parse(res.category);
          const mockProgram: Program = {
            _id: programId,
            name: res.title,
            description: res.description,
            category: category.name,
            price: res.price,
          };
          this.program.set(mockProgram);
        },
      });
  }

  loadSlots(programId: string): void {
    this.isLoading.set(true);
    const from = new Date();
    const to = new Date(from);
    to.setDate(to.getDate() + this.daysToGenerate - 1);

    this._slotService
      .getSlotInstancesForProgram(
        programId,
        from.toISOString(),
        to.toISOString(),
        this._slotFetchLimit,
        1
      )
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: ISlotInstancePaginatedResponse) => {
          this._loggerService.info('slot instances are :', res);
          this.slotInstances.set(res.data || []);
          this.pagination.set(res.pagination);
          this.generateDayGroups();
          if (res.pagination?.hasNextPage) {
            this._toastService.info(
              'Showing the first set of upcoming slots. Narrow your filters for more.'
            );
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this._loggerService.error('Failed to fetch slots :', err);
          this.isLoading.set(false);
        },
      });
  }

  generateDayGroups(): void {
    const today = this.startOfDay(new Date());
    const groupsMap = new Map<string, DayGroup>();
    const bookedIds = this.bookedSlotIds();

    this.slotInstances().forEach((instance) => {
      const zonedInfo = this.getZonedDateInfo(instance.date, instance.timezone);
      const key = zonedInfo.dateKey;
      const date = zonedInfo.date;
      const dayOfWeek = this.getDayOfWeek(date);
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          date,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          dayOfWeek,
          dayNumber: date.getDate(),
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          isToday: this.startOfDay(date).getTime() === today.getTime(),
          occurrences: [],
        });
      }

      const occurrence = this.createOccurrence(instance, zonedInfo, dayOfWeek, bookedIds);
      if (occurrence && !occurrence.isPast) {
        groupsMap.get(key)!.occurrences.push(occurrence);
      }
    });

    const groups = Array.from(groupsMap.values())
      .map((group) => ({
        ...group,
        occurrences: group.occurrences
          .sort((a, b) => this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)),
      }))
      .filter((group) => group.occurrences.length > 0);

    groups.sort((a, b) => a.date.getTime() - b.date.getTime());
    this.dayGroups.set(groups);
  }

  createOccurrence(
    instance: ISlotInstancePublic,
    zoned: ZonedDateInfo,
    dayOfWeek: string,
    bookedIds: Set<string>
  ): SlotOccurrence {
    const parsedStart = this.parseTimeString(instance.startTime);
    const parsedEnd = this.parseTimeString(instance.endTime);
    const occurrenceDateTime = this.combineDateTimeWithTimezone(
      zoned.components,
      parsedStart.hours,
      parsedStart.minutes,
      zoned.offsetMinutes
    );
    const now = new Date();
    const capacity = Number(instance.capacity) || 0;
    const availableCapacity = Number(instance.availableCapacity) || 0;
    const booked = Math.max(0, capacity - availableCapacity);
    const isBooked = bookedIds.has(instance._id);

    return {
      slotInstanceId: instance._id,
      date: zoned.date,
      dayName: zoned.date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayOfWeek: dayOfWeek,
      startTime: parsedStart.display,
      endTime: parsedEnd.display,
      capacity: capacity,
      availableCapacity: availableCapacity,
      booked: booked,
      timezone: instance.timezone,
      status: instance.status,
      isBooked,
      isPast: occurrenceDateTime < now,
      isAvailable:
        instance.status === 'OPEN' &&
        availableCapacity > 0 &&
        occurrenceDateTime >= now &&
        !isBooked,
    };
  }

  getDayOfWeek(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  combineDateAndTime(date: Date, timeString: string): Date {
    const { hours, minutes } = this.parseTimeString(timeString);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  timeToMinutes(timeString: string): number {
    const { hours, minutes } = this.parseTimeString(timeString);
    return hours * 60 + minutes;
  }

  private parseTimeString(timeString: string): {
    hours: number;
    minutes: number;
    display: string;
  } {
    if (!timeString) {
      return { hours: 0, minutes: 0, display: '12:00 AM' };
    }

    let hours = 0;
    let minutes = 0;

    if (timeString.includes('AM') || timeString.includes('PM')) {
      const [timePart, period] = timeString.split(' ');
      const parts = timePart?.split(':') ?? [];
      hours = parseInt(parts[0] ?? '0', 10) || 0;
      minutes = parseInt(parts[1] ?? '0', 10) || 0;
      const isPM = period?.toUpperCase() === 'PM';
      if (isPM && hours !== 12) {
        hours += 12;
      }
      if (!isPM && period?.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
    } else {
      const parts = timeString.split(':');
      hours = parseInt(parts[0] ?? '0', 10) || 0;
      minutes = parseInt(parts[1] ?? '0', 10) || 0;
    }

    const display = this.formatTo12Hour(hours, minutes);
    return { hours, minutes, display };
  }

  private formatTo12Hour(hours24: number, minutes: number): string {
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hour12 = hours24 % 12 || 12;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${hour12}:${paddedMinutes} ${period}`;
  }

  private getZonedDateInfo(dateIso: string, timeZone: string): ZonedDateInfo {
    const instant = new Date(dateIso);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(instant);
    const getValue = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value ?? '0');
    const year = getValue('year');
    const month = getValue('month');
    const day = getValue('day');
    const hour = getValue('hour');
    const minute = getValue('minute');
    const second = getValue('second');
    const asUTC = Date.UTC(year, month - 1, day, hour, minute, second);
    const offsetMinutes = (asUTC - instant.getTime()) / (60 * 1000);
    const midnightUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
    const date = new Date(midnightUtc - offsetMinutes * 60 * 1000);
    const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      dateKey,
      date,
      components: { year, month, day },
      offsetMinutes,
    };
  }

  private combineDateTimeWithTimezone(
    components: { year: number; month: number; day: number },
    hours: number,
    minutes: number,
    offsetMinutes: number
  ): Date {
    const utcTimestamp = Date.UTC(
      components.year,
      components.month - 1,
      components.day,
      hours,
      minutes,
      0
    );

    return new Date(utcTimestamp - offsetMinutes * 60 * 1000);
  }

  selectOccurrence(occurrence: SlotOccurrence): void {
    if (this.canBook(occurrence)) {
      this.selectedOccurrence.set(occurrence);
      this.showBookingModal.set(true);
    }
  }

  canBook(occurrence: SlotOccurrence): boolean {
    return (
      !occurrence.isPast &&
      occurrence.isAvailable &&
      !occurrence.isBooked &&
      occurrence.booked < occurrence.capacity
    );
  }

  confirmBooking(): void {
    const occurrence = this.selectedOccurrence();
    if (!occurrence) return;

    this._bookingService
      .createBooking(occurrence.slotInstanceId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._loggerService.info('booking confirmed :', res);
          this.bookedSlotIds.update((current) => {
            const updated = new Set(current);
            updated.add(occurrence.slotInstanceId);
            return updated;
          });
          this.dayGroups.update((groups) =>
            groups.map((group) => ({
              ...group,
              occurrences: group.occurrences.map((occ) =>
                occ.slotInstanceId === occurrence.slotInstanceId
                  ? {
                    ...occ,
                    booked: occ.booked + 1,
                    availableCapacity: Math.max(0, occ.availableCapacity - 1),
                    isBooked: true,
                    isAvailable: Math.max(0, occ.availableCapacity - 1) > 0,
                  }
                  : occ
              ),
            }))
          );
          this.showSuccessModal.set(true);
          setTimeout(() => {
            this.showSuccessModal.set(false);
            this.selectedOccurrence.set(null);
          }, 3000);
        },
        error: (err) => {
          this._loggerService.error('Failed to book slot.', err);
          if (err.status === 409) {
            const message = err?.error?.message?.toLowerCase?.() ?? '';
            if (message.includes('already booked this slot')) {
              this._toastService.error('You have already booked this slot.');
            } else {
              this._toastService.error(
                'You already have a session that overlaps with this slot.'
              );
            }
          } else if (err.status === 400) {
            this._toastService.error('This slot is no longer available.');
          } else {
            this._toastService.error(
              'Failed to book the slot. Please try again.'
            );
          }
        },
        complete: () => {
          this.isLoading.set(false);
        },
      });
  }

  cancelBooking(): void {
    this.showBookingModal.set(false);
    this.selectedOccurrence.set(null);
  }

  filterByDay(day: string): void {
    this.selectedDayFilter.set(day);
  }

  getCapacityColor(occurrence: SlotOccurrence): string {
    const percentage = this.getCapacityPercentage(occurrence);
    if (percentage <= 20) return 'text-red-600';
    if (percentage <= 50) return 'text-amber-600';
    return 'text-green-600';
  }

  getCapacityBgColor(occurrence: SlotOccurrence): string {
    const percentage = this.getCapacityPercentage(occurrence);
    if (percentage <= 20) return 'bg-red-50 border-red-200';
    if (percentage <= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-green-50 border-green-200';
  }

  getAvailableSpots(occurrence: SlotOccurrence): number {
    return Math.max(0, occurrence.availableCapacity);
  }

  getCapacityPercentage(occurrence: SlotOccurrence): number {
    const capacity = Number(occurrence.capacity) || 0;
    if (capacity === 0) return 0;
    return Math.max(
      0,
      Math.min(100, (occurrence.availableCapacity / capacity) * 100)
    );
  }

  private startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
