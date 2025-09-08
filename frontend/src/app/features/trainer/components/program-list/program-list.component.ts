import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

interface FitnessProgram {
  id?: number;
  _id?: string;
  title: string;
  duration: string;
  category: string;
  description: string;
  image?: string;
  difficultyLevel: string;
  enrolledCount?: number;
  rating?: number;
  price: number;
  status?: string;
}
@Component({
  selector: 'app-program-list',
  imports: [CommonModule],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent {
  programService = inject(ProgramService);
  fitnessPrograms: FitnessProgram[] = [];
  defaultImage: string = '/trainer/fitness_program.jpg';
  router = inject(Router);

  getPrograms(): void {
    this.programService.getPrograms().subscribe({
      next: (res) => {
        console.log('Programs response:', res);
        this.fitnessPrograms = res?.programs ?? [];
      },
      error: (err) => {
        console.error('Error fetching programs:', err);
        this.fitnessPrograms = [];
      },
    });
  }

  ngOnInit() {
    this.getPrograms();
  }

  getDifficultyColor(difficultyLevel: string): string {
    const colors = {
      Beginner: 'bg-green-100 text-green-700',
      Intermediate: 'bg-yellow-100 text-yellow-700',
      Advanced: 'bg-red-100 text-red-700',
    };
    return (
      colors[difficultyLevel as keyof typeof colors] ||
      'bg-gray-100 text-gray-700'
    );
  }

  getCategoryColor(category: string): string {
    const colors = {
      HIIT: 'bg-emerald-100 text-emerald-800',
      Strength: 'bg-green-100 text-green-800',
      Yoga: 'bg-lime-100 text-lime-800',
      Running: 'bg-teal-100 text-teal-800',
      Core: 'bg-green-100 text-green-800',
      Wellness: 'bg-emerald-100 text-emerald-800',
    };
    return (
      colors[category as keyof typeof colors] || 'bg-green-100 text-green-800'
    );
  }

  onViewProgram(programId: number): void {
    console.log('Viewing program with ID:', programId);
    // Navigate to program details or open modal
  }

  onEditProgram(programId: number): void {
    console.log('Editing program with ID:', programId);
    // Navigate to edit program page
  }

  generateStars(rating: number): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => (i < Math.floor(rating) ? 1 : 0));
  }

  createProgram() {
    this.router.navigate([`/trainer/program-create`]);
  }
}
