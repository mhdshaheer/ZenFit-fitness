import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Program } from '../../../trainer/store/trainer.model';
import { ProgramService } from '../../../../core/services/program.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';
import { IPaymentCourse } from '../../../../interface/payment.interface';
import { Subject, takeUntil } from 'rxjs';
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
  imports: [],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent implements OnInit, OnDestroy {
  selectedPayment: string = 'card';
  myProgram: Program[] = [];
  programId!: string;

  // services
  private readonly _programService = inject(ProgramService);
  private readonly _loggerService = inject(LoggerService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _paymentService = inject(PaymentService);
  private readonly _destroy$ = new Subject<void>();
  private _logger = inject(LoggerService)

  program = {} as IProgram;

  paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
  ];

  ngOnInit() {
    this.programId = this._activatedRoute.snapshot.paramMap.get('id')!;
    this.getProgram(this.programId);
  }

  selectPayment(methodId: string): void {
    this.selectedPayment = methodId;
    this._logger.info(this.selectedPayment);
  }

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  }

  getStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }

  completePurchase(): void {
    const course: IPaymentCourse = {
      courseId: this.programId,
      courseName: this.program.name,
      price: this.program.price,
    };

    this._paymentService
      .createCheckout(course)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        this._logger.info('to :', res.url);
        window.location.href = res.url; // redirect to Stripe Checkout
      });
  }

  getProgram(id: string) {
    this._programService
      .getProgramByProgramId(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._loggerService.info('Program is :', res);
          const category = JSON.parse(res.category);
          this.program = {
            name: res.title,
            category: category.name,
            description: res.description,
            difficulty: res.difficultyLevel,
            duration: res.duration,
            features: [],
            price: res.price,
            rating: 0,
            reviewCount: 0.0,
          };
        },
        error: (err) => {
          this._loggerService.error('Failed to fetch program :', err);
        },
      });
  }
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
