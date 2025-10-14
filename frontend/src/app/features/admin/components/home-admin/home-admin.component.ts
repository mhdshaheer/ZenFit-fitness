import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from '../../../../shared/components/chart/chart.component';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';
import { ITopCategory } from '../../../../interface/category.interface';
import { PaymentService } from '../../../../core/services/payment.service';
import { ITopPrograms } from '../../../../interface/program.interface';
import { Subject, takeUntil } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger.service';
import {
  IRevenueData,
  IRevenueFilter,
} from '../../../../interface/payment.interface';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartComponent,
    ListComponent,
    ProgressBarComponent,
  ],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css',
})
export class HomeAdminComponent implements OnInit, OnDestroy {
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
      .getTopCategories()
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
      .getTopPrograms()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: ITopPrograms[]) => {
          this.topCourses = res;
        },
      });
  }
  getRevenueChart(filter: IRevenueFilter) {
    this._paymentService.getRevenueChart(filter).subscribe({
      next: (res) => {
        this._logger.info('chart data :', res);
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
