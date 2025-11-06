import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { PaymentService } from '../../../../core/services/payment.service';
import { PurchasedProgram } from '../../../../interface/payment.interface';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
interface Course {
  id: string;
  title: string;
  description: string;
  difficultyLevel: string;
  duration: string;
  purchasedAt: Date;
}
@Component({
  selector: 'zenfit-purchased-programs',
  imports: [CommonModule],
  templateUrl: './purchased-programs.component.html',
  styleUrl: './purchased-programs.component.css',
})
export class PurchasedProgramsComponent implements OnInit, OnDestroy {
  private readonly _paymentService = inject(PaymentService);
  private readonly _destroy$ = new Subject<void>();
  private _router = inject(Router);
  ngOnInit() {
    this.getPurchasedPrograms();
  }
  getPurchasedPrograms() {
    this._paymentService
      .getPurchasedPrograms()
      .pipe(takeUntil(this._destroy$))
      .subscribe((res: PurchasedProgram[]) => {
        this.courses = res.map((item) => {
          return {
            id: item.programId,
            title: item.title,
            description: item.description,
            difficultyLevel: item.difficultyLevel,
            duration: item.duration,
            purchasedAt: item.purchasedAt,
          };
        });
      });
  }

  // ===============================
  courses: Course[] = [];

  getDifficultyColor(level: string): string {
    switch (level.toLowerCase()) {
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

  continueCourse(course: Course): void {
    console.log('Continue course:', course);
    this._router.navigate(['/user/slots', course.id]);
  }
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
