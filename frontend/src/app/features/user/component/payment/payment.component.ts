import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Program } from '../../../trainer/store/trainer.model';
import { ProgramService } from '../../../../core/services/program.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ActivatedRoute } from '@angular/router';
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
  imports: [CommonModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css',
})
export class PaymentComponent implements OnInit {
  selectedPayment: string = 'card';
  myProgram: Program[] = [];
  programId!: string;

  // services
  private programService = inject(ProgramService);
  private loggerService = inject(LoggerService);
  private activatedRoute = inject(ActivatedRoute);

  program: IProgram = {
    name: 'Advanced HIIT Mastery',
    description:
      'Transform your fitness with our comprehensive High-Intensity Interval Training program. Designed for maximum results, this program combines cardio, strength, and endurance training to help you achieve your fitness goals.',
    duration: '12 Weeks',
    difficulty: 'Advanced',
    category: 'Cardio',
    rating: 0.0,
    reviewCount: 0.0,
    price: 79.99,
    features: [
      `12 weeks of structured workouts`,
      'Nutrition guide included',
      'Progress tracking tools',
      '24/7 support access',
      'Certificate upon completion',
    ],
  };

  paymentMethods: PaymentMethod[] = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
    { id: 'upi', name: 'UPI', icon: 'smartphone' },
    { id: 'netbanking', name: 'Net Banking', icon: 'building' },
    { id: 'wallet', name: 'Digital Wallet', icon: 'wallet' },
  ];

  ngOnInit() {
    this.programId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.getProgram(this.programId);
  }

  selectPayment(methodId: string): void {
    this.selectedPayment = methodId;
    console.log(this.selectedPayment);
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
    console.log('Processing payment with method:', this.selectedPayment);
    // Implement your payment logic here
    alert(
      'Payment processing... This is where you would integrate your payment gateway.'
    );
  }

  getProgram(id: string) {
    this.programService.getProgramByProgramId(id).subscribe({
      next: (res) => {
        this.loggerService.info('Program is :', res);
        const category = JSON.parse(res.category);
        console.log('category is :', category);
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
        this.loggerService.error('Failed to fetch program :', err);
      },
    });
  }
}
