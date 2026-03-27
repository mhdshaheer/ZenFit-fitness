import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Program } from '../../../trainer/store/trainer.model';
import { ProgramService } from '../../../../core/services/program.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { IPaymentCourse } from '../../../../interface/payment.interface';
import { Subject, takeUntil } from 'rxjs';
import { NgClass } from '@angular/common';

interface IProgram {
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: number;
  features: string[];
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'zenfit-payment',
  imports: [NgClass],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent implements OnInit, OnDestroy {
  selectedPayment = 'card';
  programId = '';
  program: IProgram | null = null;
  isLoading = true;

  // services
  private readonly _programService = inject(ProgramService);
  private readonly _loggerService = inject(LoggerService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _paymentService = inject(PaymentService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _destroy$ = new Subject<void>();

  paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
  ];

  ngOnInit() {
    this._activatedRoute.paramMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((paramMap) => {
        const id = paramMap.get('id');
        this._loggerService.info('Checkout Page Load ID:', id);
        if (id) {
          this.programId = id;
          this.getProgram(id);
        } else {
          this.isLoading = false;
          this._cdr.detectChanges();
        }
      });
  }

  selectPayment(methodId: string): void {
    this.selectedPayment = methodId;
  }

  getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  }

  completePurchase(): void {
    if (!this.program) return;
    
    const course: IPaymentCourse = {
      courseId: this.programId,
      courseName: this.program.name,
      price: this.program.price,
    };

    this._paymentService
      .createCheckout(course)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        window.location.href = res.url;
      });
  }

  getProgram(id: string) {
    this.isLoading = true;
    this._programService
      .getProgramByProgramId(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: any) => {
          this._loggerService.info('Program data received:', res);
          
          let categoryName = 'Uncategorized';
          try {
            if (res.category) {
              const catObj = typeof res.category === 'string' ? JSON.parse(res.category) : res.category;
              categoryName = catObj?.name || 'Uncategorized';
            }
          } catch (e) {
            this._loggerService.warn('Category parsing error:', e);
            if (typeof res.category === 'string') categoryName = res.category;
          }

          this.program = {
            name: res.title,
            category: categoryName,
            description: res.description,
            difficulty: res.difficultyLevel,
            duration: res.duration,
            features: [],
            price: res.price,
            rating: 4.8,
            reviewCount: 124,
          };
          this.isLoading = false;
          this._cdr.detectChanges();
        },
        error: (err) => {
          this._loggerService.error('Failed to fetch program:', err);
          this.isLoading = false;
          this._cdr.detectChanges();
        },
      });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
