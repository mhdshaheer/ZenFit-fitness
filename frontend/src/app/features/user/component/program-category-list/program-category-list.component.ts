import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
interface CategoryCard {
  id: string;
  title: string;
  icon: string;
  programCount: number;
  color: string;
  description: string;
}
@Component({
  selector: 'app-program-category-list',
  imports: [CommonModule],
  templateUrl: './program-category-list.component.html',
  styleUrl: './program-category-list.component.css',
})
export class ProgramCategoryListComponent {
  categoryCards: CategoryCard[] = [
    {
      id: 'goal-based',
      title: 'Goal-Based Categories',
      icon: '📊',
      programCount: 4,
      color: 'blue',
      description:
        'Create tasks, track time, and update progress all in one place',
    },
    {
      id: 'lifestyle-wellness',
      title: 'Lifestyle & Wellness Categories',
      icon: '🕐',
      programCount: 7,
      color: 'purple',
      description:
        'Discover how much time your team is spending on their work.',
    },
    {
      id: 'specialized',
      title: 'Specialized Categories',
      icon: '📅',
      programCount: 8,
      color: 'orange',
      description: 'Monitor how your resources are utilized across projects.',
    },
  ];

  trackByCard(index: number, card: CategoryCard): string {
    return card.id;
  }

  getIconBgClass(color: string): string {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
    };
    return colorMap[color] || colorMap['blue'];
  }

  onCardClick(card: CategoryCard): void {
    console.log('Category card clicked:', card);
    // Handle card click - navigate to specific category page
    // Example: this.router.navigate(['/categories', card.id]);
  }
}
