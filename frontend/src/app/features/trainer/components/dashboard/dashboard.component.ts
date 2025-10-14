import { Component, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ITopPrograms } from '../../../../interface/program.interface';
import { ITopCategory } from '../../../../interface/category.interface';
import { PaymentService } from '../../../../core/services/payment.service';
import { ChartComponent } from '../../../../shared/components/chart/chart.component';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';

interface RevenueData {
  name: string;
  revenue: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [ChartComponent, ListComponent, ProgressBarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private _paymentService = inject(PaymentService);
  private _destroy$ = new Subject<void>();

  topCategories: ITopCategory[] = [];
  topCourses: ITopPrograms[] = [];
  currentRevenueData: RevenueData[] = [];
  colors: string[] = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
  ];
  revenueFilter: 'weekly' | 'monthly' | 'yearly' = 'monthly';

  revenueData: Record<string, RevenueData[]> = {
    weekly: [
      { name: 'Mon', revenue: 4200 },
      { name: 'Tue', revenue: 3800 },
      { name: 'Wed', revenue: 5100 },
      { name: 'Thu', revenue: 4600 },
      { name: 'Fri', revenue: 6200 },
      { name: 'Sat', revenue: 7800 },
      { name: 'Sun', revenue: 5400 },
    ],
    monthly: [
      { name: 'Jan', revenue: 45000 },
      { name: 'Feb', revenue: 52000 },
      { name: 'Mar', revenue: 48000 },
      { name: 'Apr', revenue: 61000 },
      { name: 'May', revenue: 55000 },
      { name: 'Jun', revenue: 67000 },
      { name: 'Jul', revenue: 72000 },
      { name: 'Aug', revenue: 68000 },
      { name: 'Sep', revenue: 74000 },
      { name: 'Oct', revenue: 82000 },
      { name: 'Nov', revenue: 78000 },
      { name: 'Dec', revenue: 85000 },
    ],
    yearly: [
      { name: '2020', revenue: 420000 },
      { name: '2021', revenue: 580000 },
      { name: '2022', revenue: 720000 },
      { name: '2023', revenue: 850000 },
      { name: '2024', revenue: 920000 },
    ],
  };

  ngOnInit(): void {
    this.currentRevenueData = this.revenueData[this.revenueFilter];
    this.getTopCategories();
    this.getTopPrograms();
  }

  handleRevenueFilterChange(filter: 'weekly' | 'monthly' | 'yearly') {
    this.revenueFilter = filter;
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
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
