import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IRevenueData,
  IRevenueFilter,
} from '../../../interface/payment.interface';

@Component({
  selector: 'zenfit-chart',
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.css',
})
export class ChartComponent {
  @Input() data: IRevenueData[] = [];
  @Input() filter: IRevenueFilter = 'weekly';
  @Output() filterChange = new EventEmitter<IRevenueFilter>();

  get maxRevenue(): number {
    return Math.max(...this.data.map((d) => d.revenue), 0);
  }

  getBarHeight(value: number): number {
    const maxRevenue = Math.max(...this.data.map((d) => d.revenue), 0);
    if (maxRevenue === 0) return 0;
    return (value / maxRevenue) * 100;
  }
}
