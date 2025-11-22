import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Program {
  id?: string;
  _id?: string;
  title: string;
  duration: string;
  image?: string;
  description: string;
  category: string;
  difficultyLevel: string;
  price: number;
  enrolledCount?: number;
  rating?: number;
  status?: string;
}

@Component({
  selector: 'app-program-card',
  imports: [CommonModule],
  templateUrl: './program-card.component.html',
  styleUrl: './program-card.component.css',
})
export class ProgramCardComponent {
  //Parant to child
  @Input() program!: Program;
  @Input() defaultImage = 'trainer/fitness_program.jpg';
  @Input() button1Labal = 'View';
  @Input() button2Labal = 'Edit';
  @Input() btn2Icon =
    'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z';
  @Input() btn2Class =
    'px-4 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2';

  //Child to parant
  @Output() viewProgram = new EventEmitter<string>();
  @Output() editProgram = new EventEmitter<string>();

  getDifficultyColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getCategoryColor(category: string): string {
    switch (category.toLowerCase()) {
      case 'fitness':
        return 'bg-blue-100 text-blue-800';
      case 'yoga':
        return 'bg-purple-100 text-purple-800';
      case 'nutrition':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  generateStars(rating = 3): number[] {
    if (rating < 0) {
      return [];
    }
    const safeRating = Math.min(Math.round(rating), 5); // cap at 5
    return Array(safeRating).fill(0);
  }

  onViewProgram(id: string) {
    this.viewProgram.emit(id);
  }

  onViewProgramSlot(id: string) {
    this.editProgram.emit(id);
  }
}
