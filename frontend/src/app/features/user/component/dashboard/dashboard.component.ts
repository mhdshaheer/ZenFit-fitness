import { Component, inject, OnInit } from '@angular/core';
import { PaymentService } from '../../../../core/services/payment.service';
import { CommonModule } from '@angular/common';
import { PurchasedProgram } from '../../../../interface/payment.interface';

interface Course {
  id: string;
  title: string;
  description: string;
  difficultyLevel: string;
  duration: string;
  purchasedAt: Date;
}
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private _paymentService = inject(PaymentService);
  ngOnInit() {
    this.getPurchasedPrograms();
  }
  getPurchasedPrograms() {
    this._paymentService
      .getPurchasedPrograms()
      .subscribe((res: PurchasedProgram[]) => {
        this.courses = res.map((item) => {
          return {
            id: item.programId,
            title: item.title,
            description: item.description,
            difficultyLevel: item.difficultyLevel,
            duration: item.duration,
            purchasedAt: item.purchasedAt,
          };
        });
      });
  }

  // ===============================
  courses: Course[] = [];

  getDifficultyColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  continueCourse(course: Course): void {
    console.log('Continue course:', course);
  }
}
