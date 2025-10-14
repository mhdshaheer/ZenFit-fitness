import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartComponent } from '../../../../shared/components/chart/chart.component';
import { ListComponent } from '../../../../shared/components/list/list.component';
import { ProgressBarComponent } from '../../../../shared/components/progress-bar/progress-bar.component';
import { ITopCategory } from '../../../../interface/category.interface';
import { PaymentService } from '../../../../core/services/payment.service';

interface RevenueData {
  name: string;
  revenue: number;
}

interface Course {
  _id?: string;
  name: string;
  students: number;
  revenue: number;
  rating: number;
}

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
export class HomeAdminComponent {
  private _paymentService = inject(PaymentService);

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

  colors: string[] = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
  ];

  topCategories: ITopCategory[] = [];
  topCourses: Course[] = [
    {
      name: 'Complete Web Development Bootcamp',
      students: 3245,
      revenue: 162250,
      rating: 4.8,
    },
    {
      name: 'Python for Data Science',
      students: 2890,
      revenue: 144500,
      rating: 4.9,
    },
    {
      name: 'React Native Masterclass',
      students: 2156,
      revenue: 107800,
      rating: 4.7,
    },
    {
      name: 'Advanced JavaScript Course',
      students: 1998,
      revenue: 99900,
      rating: 4.8,
    },
    {
      name: 'Full Stack Development',
      students: 1876,
      revenue: 93800,
      rating: 4.6,
    },
  ];

  currentRevenueData: RevenueData[] = [];

  ngOnInit(): void {
    this.currentRevenueData = this.revenueData[this.revenueFilter];
    this.getTopCategories();
  }

  handleRevenueFilterChange(filter: 'weekly' | 'monthly' | 'yearly') {
    this.revenueFilter = filter;
    this.currentRevenueData = this.revenueData[filter];
  }

  getTopCategories() {
    this._paymentService.getTopCategories().subscribe({
      next: (res: ITopCategory[]) => {
        this.topCategories = res.map((item, index) => {
          return { color: this.colors[index], ...item };
        });
      },
    });
  }
}
