import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  CategoryService,
  ICategory,
} from '../../../../core/services/category.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger.service';
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
  isLoading = true;

  private readonly _router = inject(Router);
  private readonly _categoryService = inject(CategoryService);
  private readonly _logger = inject(LoggerService);
  private readonly _cdr = inject(ChangeDetectorRef);

  private readonly _destroy$ = new Subject<void>();

  categoryExtras: Record<string, { icon: string; color: string }> = {
    'Goal-Based': { icon: '🎯', color: 'primary' },
    'Lifestyle & Wellness': { icon: '🌿', color: 'success' },
    'Specialized': { icon: '⚡', color: 'warning' },
  };

  ngOnInit() {
    this.getCategories();
  }
  getCategories() {
    this.isLoading = true;
    this._categoryService
      .getCategories()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: ICategory[]) => {
          this.categories = res;
          this.categoryCards = res.map((item) => {
            const extra = this.categoryExtras[item.name] || { icon: '📊', color: 'primary' };
            return {
              title: item.name,
              description: item.description,
              id: item._id,
              color: extra.color,
              icon: extra.icon,
            };
          });
          this.isLoading = false;
          this._cdr.detectChanges();
        },
        error: (error) => {
          this._logger.error('error in category fetching', error);
          this.isLoading = false;
          this._cdr.detectChanges();
        },
      });
  }

  getIconBgClass(color: string): string {
    const colorMap: Record<string, string> = {
      primary: 'bg-primary-50 text-tertiary-600 border border-primary-100',
      success: 'bg-success-50 text-success-600 border border-success-100',
      warning: 'bg-warning-50 text-warning-600 border border-warning-100',
    };
    return colorMap[color] || colorMap['primary'];
  }

  onCardClick(card: CategoryCard): void {
    this._router.navigate(['/user/programs', card.id]);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
