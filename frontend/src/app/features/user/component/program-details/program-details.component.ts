import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { BookingService, BookedSlot } from '../../../../core/services/booking.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { PurchasedProgram } from '../../../../interface/payment.interface';

@Component({
  selector: 'zenfit-program-details',
  imports: [CommonModule],
  templateUrl: './program-details.component.html',
  styleUrl: './program-details.component.css'
})
export class ProgramDetailsComponent implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _bookingService = inject(BookingService);
  private readonly _paymentService = inject(PaymentService);
  private readonly _destroy$ = new Subject<void>();

  programId: string = '';
  program: PurchasedProgram | null = null;
  bookedSlots: BookedSlot[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.programId = this._route.snapshot.paramMap.get('programId') || '';
    if (this.programId) {
      this.loadProgramDetails();
    }
  }

  loadProgramDetails(): void {
    forkJoin({
      programs: this._paymentService.getPurchasedPrograms(),
      bookings: this._bookingService.getMyBookings(this.programId)
    })
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (result) => {
          this.program = result.programs.find(p => p.programId === this.programId) || null;
          this.bookedSlots = result.bookings;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading program details:', error);
          this.isLoading = false;
        }
      });
  }

  navigateToChat(): void {
    this._router.navigate(['/user/chat', this.programId]);
  }

  navigateToSlots(): void {
    this._router.navigate(['/user/slots', this.programId]);
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

  getDifficultyColor(level: string): string {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
      case 'intermediate':
        return 'bg-neutral-200 text-neutral-800 border-neutral-300';
      case 'advanced':
        return 'bg-neutral-900 text-white border-neutral-900';
      default:
        return 'bg-black text-white border-black';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
