import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  CategoryService,
  ICategory,
} from '../../../../core/services/category.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
export class ProgramCategoryListComponent implements OnInit, OnDestroy {
  categories: ICategory[] = [];
  categoryCards: CategoryCard[] = [];
  private readonly _router = inject(Router);
  private readonly _categoryService = inject(CategoryService);

  private readonly _destroy$ = new Subject<void>();

  categoryExtras: Record<string, { icon: string; color: string }> = {
    'Goal-Based': { icon: '📊', color: 'blue' },
    'Lifestyle & Wellness': { icon: '🕐', color: 'purple' },
    Specialized: { icon: '📅', color: 'orange' },
  };

  ngOnInit() {
    this.getCategories();
  }
  getCategories() {
    this._categoryService
      .getCategories()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
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
    this._router.navigate(['/user/programs', card.id]);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
