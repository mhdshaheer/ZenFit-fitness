import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface Program {
  id?: string;
  _id?: string;
  title: string;
  duration: string;
  image?: string;
  description: string;
  category: string | { name?: string; _id?: string; id?: string };
  difficultyLevel: string;
  price: number;
  enrolledCount?: number;
  rating?: number;
  status?: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected' | string;
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
    'px-4 py-2 border border-primary-600 text-primary-600 text-sm font-medium rounded-lg hover:bg-primary-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2';

  //Child to parant
  @Output() viewProgram = new EventEmitter<string>();
  @Output() editProgram = new EventEmitter<string>();

  getDifficultyColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-success-100 text-success-800';
      case 'intermediate':
        return 'bg-warning-100 text-warning-800';
      case 'advanced':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  }

  getApprovalBadge(status?: string): string {
    switch ((status || 'Pending').toLowerCase()) {
      case 'approved':
        return 'bg-success-100 text-success-800';
      case 'rejected':
        return 'bg-error-100 text-error-800';
      case 'pending':
      default:
        return 'bg-warning-100 text-warning-800';
    }
  }

  getCategoryColor(category: string | { name?: string }): string {
    const categoryName = typeof category === 'string' ? category : category?.name || '';
    switch (categoryName.toLowerCase()) {
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

  get categoryDisplay(): string {
    if (typeof this.program.category === 'string') {
      return this.program.category;
    }
    return this.program.category?.name || 'Unknown';
  }

  onViewProgram(id: string) {
    this.viewProgram.emit(id);
  }

  onViewProgramSlot(id: string) {
    this.editProgram.emit(id);
  }
}
