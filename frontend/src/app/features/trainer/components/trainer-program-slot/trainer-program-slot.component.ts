import { Component } from '@angular/core';
import {
  BookingSelection,
  CalendarDay,
  ComponentConfig,
  TimeSlot,
  TimeSlotComponent,
} from '../../../../shared/components/time-slot/time-slot.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trainer-program-slot',
  imports: [TimeSlotComponent, CommonModule],
  templateUrl: './trainer-program-slot.component.html',
  styleUrl: './trainer-program-slot.component.css',
})
export class TrainerProgramSlotComponent {
  showTimeSlotSelector = false;
  lastBooking: BookingSelection | null = null;
  minBookingDate = new Date(); // Today
  maxBookingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  // Configuration for fitness training
  selectorConfig: ComponentConfig = {
    title: 'Schedule Your Fitness Training Session',
    timezone: 'America/New_York Time (EST)',
    timezoneShort: 'EST',
    duration: 45,
    durationUnit: 'min workout',
    confirmButtonText: 'Book Training',
    brandName: 'FitLife Pro',
    primaryColor: '#059669',
    disablePastDates: true,
  };

  // Sample time slots - in real app, fetch from API
  availableTimeSlots: TimeSlot[] = [
    { id: '1', time: '6:00 AM', available: true },
    { id: '2', time: '7:30 AM', available: true },
    { id: '3', time: '9:00 AM', available: true },
    { id: '4', time: '10:30 AM', available: false },
    { id: '5', time: '12:00 PM', available: true },
    { id: '6', time: '2:00 PM', available: true },
    { id: '7', time: '4:30 PM', available: true },
    { id: '8', time: '6:00 PM', available: true },
    { id: '9', time: '7:30 PM', available: false },
  ];

  openTimeSlotSelector() {
    this.showTimeSlotSelector = true;
  }

  closeTimeSlotSelector() {
    this.showTimeSlotSelector = false;
  }

  onBookingConfirmed(booking: BookingSelection) {
    console.log('Booking confirmed:', booking);
    this.lastBooking = booking;
    this.showTimeSlotSelector = false;

    // Here you would typically call your booking service
    // this.bookingService.createBooking(booking).subscribe(...)
  }

  onDaySelected(day: CalendarDay) {
    console.log('Day selected:', day);
    // Optionally load time slots for this specific day
    // this.loadTimeSlotsForDay(day.fullDate);
  }

  onTimeSlotSelected(timeSlot: TimeSlot) {
    console.log('Time slot selected:', timeSlot);
  }
}
