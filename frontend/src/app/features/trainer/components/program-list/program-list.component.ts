import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { CategoryService, ICategory } from '../../../../core/services/category.service';
import { Router } from '@angular/router';
import { ProgramCardComponent } from '../../../../shared/components/program-card/program-card.component';
import { firstValueFrom, forkJoin, Subject } from 'rxjs';
import { PaymentService } from '../../../../core/services/payment.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { FormsModule } from '@angular/forms';

export interface FitnessProgram {
  id?: string;
  _id?: string;
  title: string;
  duration: string;
  category: string;
  categoryId?: string; // Add categoryId for filtering
  description: string;
  image?: string;
  difficultyLevel: string;
  enrolledCount?: number;
  rating?: number;
  price: number;
  status?: string;
}

export interface ProgramFilters {
  page: number;
  limit: number;
  search: string;
  category: string;
  difficultyLevel: string;
  status: string;
}

export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Component({
  selector: 'app-program-list',
  imports: [ProgramCardComponent, FormsModule],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnInit, OnDestroy {
  private readonly _programService = inject(ProgramService);
  private readonly _categoryService = inject(CategoryService);
  private readonly _paymentService = inject(PaymentService);
  private readonly _router = inject(Router);
  private readonly _logger = inject(LoggerService);

  fitnessPrograms: FitnessProgram[] = [];
  categories: ICategory[] = [];
  loading = false;
  defaultImage = '/trainer/fitness_program.jpg';
  private readonly _destroy$ = new Subject<void>();
  private searchTimeout: any;

  filters: ProgramFilters = {
    page: 1,
    limit: 9,
    search: '',
    category: '',
    difficultyLevel: '',
    status: ''
  };

  pagination: PaginationResult = {
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 0
  };

  readonly Math = Math;

  ngOnInit() {
    this.loadCategories();
    this.getPrograms();
  }

  extractCategoriesFromPrograms(programs: any[]): void {
    const categoryMap = new Map();
    
    programs.forEach((program: any) => {
      if (typeof program.category === 'string') {
        try {
          const parsed = JSON.parse(program.category);
          if (parsed._id && parsed.name) {
            categoryMap.set(parsed._id, {
              _id: parsed._id,
              name: parsed.name,
              description: parsed.description || '',
              parantId: parsed.parantId || null
            });
          }
        } catch {
          // Skip invalid JSON
        }
      } else if (program.category && typeof program.category === 'object') {
        if (program.category._id && program.category.name) {
          categoryMap.set(program.category._id, {
            _id: program.category._id,
            name: program.category.name,
            description: program.category.description || '',
            parantId: program.category.parantId || null
          });
        }
      }
    });
    
    this.categories = Array.from(categoryMap.values());
    
  }

  async loadCategories(): Promise<void> {
    // We'll load categories after we get programs to ensure they match
    this.categories = [];
  }

  async enrichProgramsWithEnrollmentCount(programs: any[]): Promise<FitnessProgram[]> {
    if (programs.length === 0) return [];
    
    try {
      const programObservables = programs.map((item: any) => {
        return this._paymentService.getEntrolledUsers(item.id!);
      });
      const counts = await firstValueFrom(forkJoin(programObservables));
      
      return programs.map((item: any, index: number) => {
        let categoryName: string;
        let categoryId: string;
        
        try {
          if (typeof item.category === 'string') {
            try {
              const parsedCategory = JSON.parse(item.category);
              categoryName = parsedCategory.name || 'Unknown Category';
              categoryId = parsedCategory._id || parsedCategory.id || '';
            } catch {
              categoryName = item.category;
              categoryId = item.category;
            }
          } else if (typeof item.category === 'object' && item.category !== null) {
            categoryName = item.category.name || 'Unknown Category';
            categoryId = item.category._id || item.category.id || '';
          } else {
            categoryName = 'Unknown Category';
            categoryId = '';
          }
        } catch (error) {
          categoryName = 'Unknown Category';
          categoryId = '';
        }
        
        return {
          ...item,
          category: categoryName,
          categoryId: categoryId, // Add separate categoryId for filtering
          enrolledCount: (counts as any)[index].count,
        };
      });
    } catch (err) {
      return programs.map((item: any) => {
        let categoryName: string;
        let categoryId: string;
        
        try {
          if (typeof item.category === 'string') {
            try {
              const parsedCategory = JSON.parse(item.category);
              categoryName = parsedCategory.name || 'Unknown Category';
              categoryId = parsedCategory._id || parsedCategory.id || '';
            } catch {
              categoryName = item.category;
              categoryId = item.category;
            }
          } else if (typeof item.category === 'object' && item.category !== null) {
            categoryName = item.category.name || 'Unknown Category';
            categoryId = item.category._id || item.category.id || '';
          } else {
            categoryName = 'Unknown Category';
            categoryId = '';
          }
        } catch (error) {
          categoryName = 'Unknown Category';
          categoryId = '';
        }
        
        return {
          ...item,
          category: categoryName,
          categoryId: categoryId,
          enrolledCount: 0,
        };
      });
    }
  }

  async getPrograms(): Promise<void> {
    this.loading = true;
    try {
      // Try to use the new paginated method first, fallback to old method if not available
      let res: any;
      try {
        res = await firstValueFrom(this._programService.getTrainerPrograms(this.filters));
        // If backend supports pagination, use it directly
        if (res.pagination) {
          this.pagination = res.pagination;
          this.fitnessPrograms = await this.enrichProgramsWithEnrollmentCount(res.programs);
          return;
        }
      } catch (backendError) {
        // Fallback to client-side filtering if backend doesn't support it yet
        res = await firstValueFrom(this._programService.getPrograms());
      }
      
      let filteredPrograms = res.programs;
      
      // Extract categories from programs to ensure dropdown matches
      this.extractCategoriesFromPrograms(filteredPrograms);

      // Apply client-side filtering (temporary until backend supports it)
      if (this.filters.search) {
        const searchTerm = this.filters.search.toLowerCase();
        filteredPrograms = filteredPrograms.filter((program: any) => 
          program.title.toLowerCase().includes(searchTerm) ||
          program.description.toLowerCase().includes(searchTerm)
        );
      }

      if (this.filters.category) {
        filteredPrograms = filteredPrograms.filter((program: any) => {
          let categoryId = '';
          
          if (typeof program.category === 'string') {
            try {
              const parsed = JSON.parse(program.category);
              categoryId = parsed._id || parsed.id || '';
            } catch {
              categoryId = program.category;
            }
          } else if (program.category && typeof program.category === 'object') {
            categoryId = program.category._id || program.category.id || '';
          }
          
          return categoryId === this.filters.category;
        });
      }

      if (this.filters.difficultyLevel) {
        filteredPrograms = filteredPrograms.filter((program: any) => 
          program.difficultyLevel === this.filters.difficultyLevel
        );
      }

      if (this.filters.status) {
        filteredPrograms = filteredPrograms.filter((program: any) => 
          program.status === this.filters.status
        );
      }

      // Apply pagination
      const startIndex = (this.filters.page - 1) * this.filters.limit;
      const endIndex = startIndex + this.filters.limit;
      const paginatedPrograms = filteredPrograms.slice(startIndex, endIndex);

      // Update pagination info
      this.pagination = {
        total: filteredPrograms.length,
        page: this.filters.page,
        limit: this.filters.limit,
        totalPages: Math.ceil(filteredPrograms.length / this.filters.limit)
      };

      // Get enrolled counts for paginated programs
      this.fitnessPrograms = await this.enrichProgramsWithEnrollmentCount(paginatedPrograms);
    } catch (err) {
      this.fitnessPrograms = [];
      this.pagination = {
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0
      };
    } finally {
      this.loading = false;
    }
  }

  onViewProgram(programId: string): void {
    this._router.navigate(['/trainer/program', programId]);
  }

  onProgramSlot(programId: string): void {
    this._router.navigate(['/trainer/purchased-users', programId]);
  }

  onRealTimeSearch(): void {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout for debouncing (300ms delay)
    this.searchTimeout = setTimeout(() => {
      this.filters.page = 1;
      this.getPrograms();
    }, 300);
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.getPrograms();
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.page;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return pages;
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this._destroy$.next();
    this._destroy$.complete();
  }
}
