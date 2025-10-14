import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

interface RevenueData {
  name: string;
  revenue: number;
}
@Component({
  selector: 'zenfit-chart',
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent {
  @Input() data: RevenueData[] = [];
  @Input() filter: 'weekly' | 'monthly' | 'yearly' = 'monthly';
  @Output() filterChange = new EventEmitter<'weekly' | 'monthly' | 'yearly'>();

  get maxRevenue(): number {
    return Math.max(...this.data.map((d) => d.revenue), 0);
  }

  getBarHeight(value: number): number {
    const maxRevenue = Math.max(...this.data.map((d) => d.revenue), 0);
    if (maxRevenue === 0) return 0;
    return (value / maxRevenue) * 100;
  }

  formatRevenue(revenue: number): string {
    if (revenue >= 1000) return `$${(revenue / 1000).toFixed(0)}k`;
    return `$${revenue}`;
  }
}
