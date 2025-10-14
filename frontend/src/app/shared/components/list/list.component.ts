import { Component, Input } from '@angular/core';

interface Course {
  name: string;
  students: number;
  revenue: number;
}
@Component({
  selector: 'zenfit-list',
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  @Input() courses: Course[] = [];

  formatNumber(num: number): string {
    return num.toLocaleString();
  }
}
