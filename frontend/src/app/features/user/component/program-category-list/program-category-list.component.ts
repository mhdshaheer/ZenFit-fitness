import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  CategoryService,
  ICategory,
} from '../../../../core/services/category.service';
interface CategoryCard {
  id: string;
  title: string;
  icon?: string;
  color?: string;
  description: string;
}

@Component({
  selector: 'app-program-category-list',
  imports: [CommonModule],
  templateUrl: './program-category-list.component.html',
  styleUrl: './program-category-list.component.css',
})
export class ProgramCategoryListComponent implements OnInit {
  categories: ICategory[] = [];
  constructor(private categoryService: CategoryService) {}
  categoryCards: CategoryCard[] = [
    // {
    //   id: 'goal-based',
    //   title: 'Goal-Based Categories',
    //   icon: '📊',
    //   color: 'blue',
    //   description:
    //     'Create tasks, track time, and update progress all in one place',
    // },
    // {
    //   id: 'lifestyle-wellness',
    //   title: 'Lifestyle & Wellness Categories',
    //   icon: '🕐',
    //   color: 'purple',
    //   description:
    //     'Discover how much time your team is spending on their work.',
    // },
    // {
    //   id: 'specialized',
    //   title: 'Specialized Categories',
    //   icon: '📅',
    //   color: 'orange',
    //   description: 'Monitor how your resources are utilized across projects.',
    // },
  ];

  categoryExtras: Record<string, { icon: string; color: string }> = {
    'Goal-Based': { icon: '📊', color: 'blue' },
    'Lifestyle & Wellness': { icon: '🕐', color: 'purple' },
    Specialized: { icon: '📅', color: 'orange' },
  };

  ngOnInit() {
    this.getCategories();
  }
  getCategories() {
    this.categoryService.getCategories().subscribe({
      next: (res: ICategory[]) => {
        console.log('categories are :', res);
        this.categories = res;
        this.categoryCards = res.map((item) => {
          return {
            title: item.name,
            description: item.description,
            id: item._id,
            color: this.categoryExtras[item.name]?.color || 'red',
            icon: this.categoryExtras[item.name]?.icon || '📊',
          };
        });
      },
      error: (error) => {
        console.log('error in category fetching', error);
      },
    });
  }
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
