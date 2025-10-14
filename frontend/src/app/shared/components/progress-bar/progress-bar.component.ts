import { Component, Input } from '@angular/core';
import { ITopCategory } from '../../../interface/category.interface';

@Component({
  selector: 'zenfit-progress-bar',
  imports: [],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css',
})
export class ProgressBarComponent {
  @Input() categories: ITopCategory[] = [];

  getCategoryWidth(courses: number): number {
    const maxCourses = Math.max(
      ...this.categories.map((c) => c.totalPurchases),
      1
    );
    return (courses / maxCourses) * 100;
  }
}
