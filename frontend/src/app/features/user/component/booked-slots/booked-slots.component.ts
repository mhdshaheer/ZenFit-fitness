import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { BookingService, BookedSlot } from '../../../../core/services/booking.service';
import { Router } from '@angular/router';

interface SlotWithProgram extends BookedSlot {
  programName?: string;
  isUpcoming?: boolean;
}

@Component({
  selector: 'zenfit-booked-slots',
  imports: [CommonModule],
  templateUrl: './booked-slots.component.html',
  styleUrl: './booked-slots.component.css'
})
export class BookedSlotsComponent implements OnInit, OnDestroy {
  private readonly _bookingService = inject(BookingService);
  private readonly _router = inject(Router);
  private readonly _destroy$ = new Subject<void>();

  upcomingSlots: SlotWithProgram[] = [];
  pastSlots: SlotWithProgram[] = [];
  activeTab: 'upcoming' | 'past' = 'upcoming';
  isLoading = true;

  ngOnInit(): void {
    this.loadBookedSlots();
  }

  loadBookedSlots(): void {
    this._bookingService.getMyBookings()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (slots) => {
          const now = new Date();
          
          // Separate upcoming and past slots
          const upcoming: SlotWithProgram[] = [];
          const past: SlotWithProgram[] = [];

          slots.forEach(slot => {
            const slotDateTime = new Date(slot.date);
            const slotWithProgram: SlotWithProgram = {
              ...slot,
              programName: 'Fitness Program', // Will be populated from API
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
          console.error('Error loading booked slots:', error);
          this.isLoading = false;
        }
      });
  }

  switchTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
  }

  joinMeeting(slot: SlotWithProgram): void {
    // Dummy functionality for now
    console.log('Joining meeting for slot:', slot);
    alert(`Joining meeting for ${slot.programName} on ${this.formatDate(slot.date)}`);
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

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
