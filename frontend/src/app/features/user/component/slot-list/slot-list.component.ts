import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ISlotUserOutput } from '../../../../interface/slot.interface';
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
  slotId: string;
  date: Date;
  dayName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  capacity: number;
  booked: number;
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
  slots = signal<ISlotUserOutput[]>([]);
  dayGroups = signal<DayGroup[]>([]);
  selectedOccurrence = signal<SlotOccurrence | null>(null);
  showBookingModal = signal(false);
  showSuccessModal = signal(false);
  isLoading = signal(true);
  selectedDayFilter = signal<string>('all');
  currentUserId!: string;

  daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  daysToGenerate = 7;

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
    this.isLoading.set(false);
    this._slotService
      .getSlotOnUser(programId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._loggerService.info('slots are :', res);
          this.slots.set(res);
          this.generateDayGroups();
          this.isLoading.set(false);
        },
        error: (err) => {
          this._loggerService.error('Failed to fetch slots :', err);
        },
      });
  }

  generateDayGroups(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groups: DayGroup[] = [];
    for (let i = 0; i < this.daysToGenerate; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dayOfWeek = this.getDayOfWeek(date);
      const occurrences: SlotOccurrence[] = [];

      // Find slots that match this day
      this.slots().forEach((slot) => {
        if (slot.day == dayOfWeek) {
          occurrences.push(
            this.createOccurrence(slot, date, dayOfWeek, this.currentUserId)
          );
        }
      });

      // Only add days that have occurrences
      if (occurrences.length > 0) {
        groups.push({
          date: date,
          dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
          dayOfWeek: dayOfWeek,
          dayNumber: date.getDate(),
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          isToday: date.getTime() === today.getTime(),
          occurrences: occurrences.sort(
            (a, b) =>
              this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
          ),
        });
      }
    }
    this.dayGroups.set(groups);
  }

  createOccurrence(
    slot: ISlotUserOutput,
    date: Date,
    dayOfWeek: string,
    currentUserId: string
  ): SlotOccurrence {
    const occurrenceDateTime = this.combineDateAndTime(date, slot.startTime);
    const now = new Date();
    const booked = Number(slot.booked) || 0;
    const capacity = Number(slot.capacity) || 0;
    const bookedUsers = slot.bookedUsers || [];

    return {
      slotId: slot._id,
      date: date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dayOfWeek: dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      capacity: capacity,
      booked: booked,
      isBooked: bookedUsers.includes(currentUserId),
      isPast: occurrenceDateTime < now,
      isAvailable: booked < capacity,
    };
  }

  getDayOfWeek(date: Date): string {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  combineDateAndTime(date: Date, timeString: string): Date {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const combined = new Date(date);
    combined.setHours(hours, minutes || 0, 0, 0);
    return combined;
  }

  timeToMinutes(timeString: string): number {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    return hours * 60 + (minutes || 0);
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
      .createBooking(occurrence.slotId, occurrence.dayOfWeek, occurrence.date)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._loggerService.info('booking confirmed :', res);
          this.dayGroups.update((groups) =>
            groups.map((group) => ({
              ...group,
              occurrences: group.occurrences.map((occ) =>
                occ.slotId === occurrence.slotId &&
                occ.date.getTime() === occurrence.date.getTime()
                  ? { ...occ, booked: occ.booked + 1, isBooked: true }
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
          this._toastService.error(
            'Failed to book the slot. Please try again.'
          );
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
    const booked = Number(occurrence.booked) || 0;
    const capacity = Number(occurrence.capacity) || 0;
    return Math.max(0, capacity - booked);
  }

  getCapacityPercentage(occurrence: SlotOccurrence): number {
    const booked = Number(occurrence.booked) || 0;
    const capacity = Number(occurrence.capacity) || 0;
    if (capacity === 0) return 0;
    return Math.max(0, Math.min(100, ((capacity - booked) / capacity) * 100));
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
