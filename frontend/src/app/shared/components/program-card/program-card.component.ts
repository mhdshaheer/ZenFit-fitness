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
  imports: [],
  templateUrl: './program-card.component.html',
  styleUrl: './program-card.component.css',
})
export class ProgramCardComponent {
  //Parant to child
  @Input() program!: Program;
  @Input() defaultImage: string = 'trainer/fitness_program.jpg';

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

  generateStars(rating: number = 3): number[] {
    if (rating < 0) {
      return [];
    }
    const safeRating = Math.min(Math.round(rating), 5); // cap at 5
    return Array(safeRating).fill(0);
  }

  onViewProgram(id: string) {
    this.viewProgram.emit(id);
  }

  onEditProgram(id: string) {
    this.editProgram.emit(id);
  }
}
