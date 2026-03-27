import { Component, inject, OnDestroy, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FitnessProgram } from '../../../trainer/components/program-list/program-list.component';
import { ProgramCardComponent } from '../../../../shared/components/program-card/program-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService } from '../../../../core/services/program.service';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';
import { ISubCategory } from '../../../../interface/category.interface';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';
import { LoggerService } from '../../../../core/services/logger.service';

interface IProgramType {
  label: string;
  value: string;
  selected: boolean;
}

@Component({
  selector: 'app-program-list',
  imports: [CommonModule, ProgramCardComponent, FormsModule, SearchBarComponent],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnDestroy, OnInit {
  // Signals for robust reactivity
  searchTerm = signal('');
  allProgramsData = signal<FitnessProgram[]>([]);
  programTypes = signal<IProgramType[]>([]);
  
  // Component UI State
  selectedFilter = 'All Programs';
  isFilterMenuOpen = false;
  isSortMenuOpen = false;
  selectedSort = signal('Latest');

  private readonly _programService = inject(ProgramService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _route = inject(Router);
  private readonly _logger = inject(LoggerService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _location = inject(Location);

  private readonly _destroy$ = new Subject<void>();

  // UI Components Config
  btn2Label = 'Purchase';
  btn2Icon = 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z';
  btn2Class = 'px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2';

  // Derived State (Computed) - This is now directly the backend data
  filteredPrograms = computed(() => {
    return [...this.allProgramsData()];
  });

  activeFiltersCount = computed(() => this.programTypes().filter(t => t.selected).length);
  activeSelectedFilters = computed(() => this.programTypes().filter(t => t.selected));

  ngOnInit() {
    // 1. Initial load from snapshot to ensure immediate fetch
    const initialId = this._activatedRoute.snapshot.paramMap.get('id');
    if (initialId) {
      this._logger.info('Performing initial fetch from route snapshot:', initialId);
      this.getSubCategory(initialId);
    }

    // 2. Subscribe to subsequent param changes for same-component navigation
    this._activatedRoute.paramMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((params) => {
        const id = params.get('id');
        if (id && id !== initialId) {
          this._logger.info('Param change detected in subscription:', id);
          this.searchTerm.set('');
          this.programTypes.set([]);
          this.getSubCategory(id);
        }
      });
  }

  async getSubCategory(id: string, filters?: any) {
    this._logger.info('GET SUB CATEGORY START for ID:', id, 'Filters:', filters);
    try {
      const res = await lastValueFrom(
        this._programService.getProgramsByParantId(id, filters).pipe(takeUntil(this._destroy$))
      );

      if (res && res.programs && res.programs.length > 0) {
        this._logger.info('Backend returned programs count:', res.programs.length);
        const uniqueSubCats = new Map<string, string>();
        
        const mapped = res.programs.map((item: any) => {
          // ROBUST CATEGORY PARSING
          let subCatName = 'Uncategorized';
          try {
            if (item.category) {
              const catObj = typeof item.category === 'string' ? JSON.parse(item.category) : item.category;
              subCatName = (catObj.name || 'Uncategorized').trim();
              if (catObj._id) uniqueSubCats.set(catObj._id.toString(), subCatName);
            }
          } catch (e) {
            this._logger.warn('Non-JSON category for:', item.title);
          }

          // ROBUST ID MAPPING for trackBy
          return {
            ...item,
            id: item.id || item._id, // Ensure we have a trackable ID
            category: subCatName
          } as FitnessProgram;
        });

        // Only update local programTypes if they're empty (e.g., initial load)
        if (this.programTypes().length === 0) {
          this.programTypes.set(Array.from(uniqueSubCats.entries()).map(([cid, name]) => ({
            label: name,
            value: cid,
            selected: false
          })));
        }

        // Atomic update to signal
        this.allProgramsData.set(mapped);
        this._cdr.detectChanges();
        this._logger.info('Signal allProgramsData updated with count:', mapped.length);
      } else {
        this._logger.warn('Empty programs list returned from backend for category:', id);
        this.allProgramsData.set([]);
      }
    } catch (err) {
      this._logger.error('API call failed in getSubCategory:', err);
      this.allProgramsData.set([]);
    }
  }

  private refreshData() {
    const id = this._activatedRoute.snapshot.paramMap.get('id');
    const search = this.searchTerm();
    const sort = this.selectedSort();
    const selectedSubCats = this.programTypes().filter(t => t.selected).map(t => t.value);
    
    if (id) {
      this.getSubCategory(id, { search, sort, subCategory: selectedSubCats });
    }
  }

  getBack() {
    this._location.back();
  }

  onViewProgram(programId: string): void {
    this._logger.info('Viewing Program ID:', programId);
    this._route.navigate(['/user/view-program', programId]);
  }

  onSubscribeProgram(programId: string): void {
    this._route.navigate(['user/payment', programId]);
  }

  sortOptions = [
    { label: 'Latest', value: 'createdDate' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Duration', value: 'duration' },
  ];

  onSearch(text: string) {
    this._logger.info('Search event emitted:', text);
    this.searchTerm.set(text || '');
    this.refreshData();
  }

  clearSearch() {
    this.searchTerm.set('');
    this.refreshData();
  }

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  onFilterChange(option: IProgramType) {
    this.programTypes.update(types => types.map(t => 
      t.value === option.value ? { ...t, selected: !t.selected } : t
    ));
    this.refreshData();
  }

  removeFilter(option: IProgramType) {
    this.onFilterChange(option);
  }

  clearAllFilters() {
    this._logger.info('CLEAR ALL FILTERS button clicked');
    this.searchTerm.set('');
    this.programTypes.update(types => types.map(t => ({ ...t, selected: false })));
    this.isFilterMenuOpen = false;
    this.refreshData();
  }

  toggleSortMenu() {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }

  onSortChange(option: any) {
    this.selectedSort.set(option.label);
    this.isSortMenuOpen = false;
    this.refreshData();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
