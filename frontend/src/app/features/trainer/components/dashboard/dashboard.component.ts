import { Component, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ITopPrograms } from '../../../../interface/program.interface';
import { ITopCategory } from '../../../../interface/category.interface';
import { PaymentService } from '../../../../core/services/payment.service';
import { ChartComponent } from '../../../../shared/components/chart/chart.component';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';
import {
  IRevenueData,
  IRevenueFilter,
} from '../../../../interface/payment.interface';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-dashboard',
  imports: [ChartComponent, ListComponent, ProgressBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private _paymentService = inject(PaymentService);
  private _destroy$ = new Subject<void>();
  private _logger = inject(LoggerService);

  topCategories: ITopCategory[] = [];
  topCourses: ITopPrograms[] = [];
  currentRevenueData: IRevenueData[] = [];
  colors: string[] = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
  ];
  revenueFilter: IRevenueFilter = 'weekly';

  revenueData: Record<string, IRevenueData[]> = {
    weekly: [],
    monthly: [],
    yearly: [],
  };

  ngOnInit(): void {
    this.currentRevenueData = this.revenueData[this.revenueFilter];
    this.getTopCategories();
    this.getTopPrograms();
    this.getRevenueChart(this.revenueFilter);
  }

  handleRevenueFilterChange(filter: IRevenueFilter) {
    this.revenueFilter = filter;
    this.getRevenueChart(this.revenueFilter);
    this.currentRevenueData = this.revenueData[filter];
  }

  getTopCategories() {
    this._paymentService
      .getTopCategoriesByTrainer()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: ITopCategory[]) => {
          this.topCategories = res.map((item, index) => {
            return { color: this.colors[index], ...item };
          });
        },
      });
  }
  getTopPrograms() {
    this._paymentService
      .getTopProgramsByTrainer()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: ITopPrograms[]) => {
          this.topCourses = res;
        },
      });
  }
  getRevenueChart(filter: IRevenueFilter) {
    this._paymentService
      .getRevenueChart(filter)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.revenueData[filter] = res;
          this.currentRevenueData = this.revenueData[filter];
        },
        error: (err) => {
          this._logger.error('failed to fetch chart data ', err);
        },
      });
  }
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
