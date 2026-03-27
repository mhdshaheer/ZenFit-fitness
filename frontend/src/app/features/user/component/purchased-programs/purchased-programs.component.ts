import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PaymentService } from '../../../../core/services/payment.service';
import { PurchasedProgram } from '../../../../interface/payment.interface';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
interface Course {
  id: string;
  title: string;
  description: string;
  difficultyLevel: string;
  purchasedAt: Date;
}
@Component({
  selector: 'app-purchased-programs',
  imports: [CommonModule, RouterModule],
  templateUrl: './purchased-programs.component.html',
  styleUrl: './purchased-programs.component.css',
})
export class PurchasedProgramsComponent implements OnInit, OnDestroy {
  private readonly _paymentService = inject(PaymentService);
  private readonly _destroy$ = new Subject<void>();
  private readonly _cdr = inject(ChangeDetectorRef);
  private _router = inject(Router);

  isLoading = true;

  ngOnInit() {
    this.getPurchasedPrograms();
  }
  getPurchasedPrograms() {
    this.isLoading = true;
    this._paymentService
      .getPurchasedPrograms()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: PurchasedProgram[]) => {
          this.courses = res.map((item) => {
            return {
              id: item.programId || '',
              title: item.title || 'Untitled Program',
              description: item.description || '',
              difficultyLevel: item.difficultyLevel || 'Beginner',
              purchasedAt: item.purchasedAt,
            };
          }).filter(course => course.id !== '');
          this.isLoading = false;
          this._cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this._cdr.detectChanges();
        }
      });
  }

  // ===============================
  courses: Course[] = [];

  getDifficultyColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'intermediate':
        return 'bg-warning-100 text-warning-700 border-warning-200';
      case 'advanced':
        return 'bg-error-100 text-error-700 border-error-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  }

  continueCourse(course: Course): void {
    this._router.navigate(['/user/slots', course.id]);
  }

  viewSlots(course: Course): void {
    if (!course.id) {
      return;
    }
    this._router.navigate(['/user/slots', course.id]);
  }

  viewProgramDetails(course: Course): void {
    this._router.navigate(['/user/program-details', course.id]);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
