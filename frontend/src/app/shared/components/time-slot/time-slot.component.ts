import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
export interface TimeSlot {
  time: string;
  available: boolean;
  id?: string;
}

export interface CalendarDay {
  day: number;
  dayName: string;
  month: string;
  fullDate: Date;
  isSelected: boolean;
  isToday: boolean;
  isDisabled?: boolean;
}

export interface BookingSelection {
  day: CalendarDay;
  timeSlot: TimeSlot;
  timezone: string;
  duration: number;
}

export interface ComponentConfig {
  title?: string;
  timezone?: string;
  timezoneShort?: string;
  duration?: number;
  durationUnit?: string;
  confirmButtonText?: string;
  brandName?: string;
  primaryColor?: string;
  disablePastDates?: boolean;
}

@Component({
  selector: 'app-time-slot',
  imports: [CommonModule],
  templateUrl: './time-slot.component.html',
  styleUrl: './time-slot.component.css',
})
export class TimeSlotComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() timeSlots: TimeSlot[] = [];
  @Input() initialDate?: Date;
  @Input() config: ComponentConfig = {};
  @Input() availableDates?: Date[];
  @Input() minDate?: Date;
  @Input() maxDate?: Date;

  @Output() closeModal = new EventEmitter<void>();
  @Output() bookingConfirmed = new EventEmitter<BookingSelection>();
  @Output() daySelected = new EventEmitter<CalendarDay>();
  @Output() timeSlotSelected = new EventEmitter<TimeSlot>();

  selectedDay: CalendarDay | null = null;
  selectedTimeSlot: TimeSlot | null = null;
  currentWeekStart: Date = new Date();
  calendarDays: CalendarDay[] = [];
  currentTimeSlots: TimeSlot[] = [];

  // Default configuration
  private defaultConfig: Required<ComponentConfig> = {
    title: 'What time works best for your session?',
    timezone: 'Europe/Amsterdam Time (20:05)',
    timezoneShort: 'GMT+2',
    duration: 30,
    durationUnit: 'min session',
    confirmButtonText: 'Book Session',
    brandName: 'FitTrainer',
    primaryColor: '#10b981',
    disablePastDates: true,
  };

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible'] && this.isVisible) {
      this.initializeComponent();
    }
    if (changes['timeSlots']) {
      this.updateCurrentTimeSlots();
    }
  }

  private initializeComponent() {
    this.config = { ...this.defaultConfig, ...this.config };
    this.currentWeekStart = this.getWeekStart(this.initialDate || new Date());
    this.generateCalendarDays();
    this.selectInitialDay();
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  private generateCalendarDays() {
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentWeekStart);
      date.setDate(this.currentWeekStart.getDate() + i);

      const day: CalendarDay = {
        day: date.getDate(),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: date,
        isSelected: false,
        isToday: date.getTime() === today.getTime(),
        isDisabled: this.isDayDisabled(date),
      };

      this.calendarDays.push(day);
    }
  }

  private isDayDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if past date should be disabled
    if (this.config.disablePastDates && date < today) {
      return true;
    }

    // Check min/max date constraints
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;

    // Check if date is in available dates list
    if (this.availableDates && this.availableDates.length > 0) {
      return !this.availableDates.some(
        (availableDate) => availableDate.toDateString() === date.toDateString()
      );
    }

    return false;
  }

  private selectInitialDay() {
    let dayToSelect = this.calendarDays.find(
      (day) => day.isToday && !day.isDisabled
    );

    if (!dayToSelect) {
      dayToSelect = this.calendarDays.find((day) => !day.isDisabled);
    }

    if (dayToSelect) {
      this.selectDay(dayToSelect);
    }
  }

  selectDay(day: CalendarDay) {
    if (day.isDisabled) return;

    this.calendarDays.forEach((d) => (d.isSelected = false));
    day.isSelected = true;
    this.selectedDay = day;
    this.selectedTimeSlot = null;
    this.updateCurrentTimeSlots();
    this.daySelected.emit(day);
  }

  selectTimeSlot(slot: TimeSlot) {
    if (!slot.available) return;

    this.selectedTimeSlot = slot;
    this.timeSlotSelected.emit(slot);
  }

  private updateCurrentTimeSlots() {
    if (!this.selectedDay) {
      this.currentTimeSlots = [];
      return;
    }

    // Filter time slots based on selected day
    // In a real app, you might call an API here
    this.currentTimeSlots = [...this.timeSlots];
  }

  previousWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.generateCalendarDays();
    this.selectInitialDay();
  }

  nextWeek() {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateCalendarDays();
    this.selectInitialDay();
  }

  get canNavigatePrevious(): boolean {
    if (!this.minDate) return true;
    const previousWeek = new Date(this.currentWeekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    return previousWeek >= this.minDate;
  }

  get canNavigateNext(): boolean {
    if (!this.maxDate) return true;
    const nextWeek = new Date(this.currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek <= this.maxDate;
  }

  get canConfirmBooking(): boolean {
    return !!(
      this.selectedDay &&
      this.selectedTimeSlot &&
      this.selectedTimeSlot.available
    );
  }

  getDayClasses(day: CalendarDay): string {
    const baseClasses = 'hover:bg-opacity-75';

    if (day.isDisabled) {
      return `${baseClasses} bg-gray-200 text-gray-400 cursor-not-allowed opacity-50`;
    }

    if (day.isSelected) {
      return `${baseClasses} bg-green-500 text-white shadow-lg`;
    }

    return `${baseClasses} bg-gray-50 text-gray-700 hover:bg-green-50`;
  }

  getTimeSlotClasses(slot: TimeSlot): string {
    if (!slot.available) {
      return 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50';
    }

    if (this.selectedTimeSlot === slot) {
      return 'border-green-500 bg-green-500 text-white shadow-lg transform scale-105';
    }

    return 'border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700';
  }

  getConfirmButtonClasses(): string {
    const baseClasses =
      'w-full py-3 px-4 font-medium rounded-lg transition-colors duration-200 transform';

    if (this.canConfirmBooking) {
      return `${baseClasses} bg-green-500 text-white hover:bg-green-600 hover:scale-[1.02]`;
    }

    return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
  }

  getConfirmButtonText(): string {
    if (this.selectedTimeSlot) {
      return `${this.config.confirmButtonText} ${this.selectedTimeSlot.time}`;
    }
    return this.config.confirmButtonText!;
  }

  trackBySlot(index: number, slot: TimeSlot): string {
    return slot.id || slot.time;
  }

  onClose() {
    this.closeModal.emit();
  }

  confirmBooking() {
    if (this.canConfirmBooking && this.selectedDay && this.selectedTimeSlot) {
      const booking: BookingSelection = {
        day: this.selectedDay,
        timeSlot: this.selectedTimeSlot,
        timezone: this.config.timezone!,
        duration: this.config.duration!,
      };

      this.bookingConfirmed.emit(booking);
    }
  }
}
