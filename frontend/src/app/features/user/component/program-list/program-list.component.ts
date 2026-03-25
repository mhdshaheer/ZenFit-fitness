import { Component, inject, OnDestroy, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
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
  imports: [ProgramCardComponent, FormsModule, SearchBarComponent],
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
  selectedSort = 'Latest';

  private readonly _programService = inject(ProgramService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _route = inject(Router);
  private readonly _logger = inject(LoggerService);
  private readonly _cdr = inject(ChangeDetectorRef);

  private readonly _destroy$ = new Subject<void>();

  // UI Components Config
  btn2Label = 'Purchase';
  btn2Icon = 'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z';
  btn2Class = 'px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2';

  // Derived State (Computed) - This handles BOTH initial view and filtered views
  filteredPrograms = computed(() => {
    const list = [...this.allProgramsData()];
    const query = this.searchTerm().toLowerCase().trim();
    const selectedLabels = this.programTypes().filter(t => t.selected).map(t => t.label.trim().toLowerCase());

    return list.filter(p => {
      // 1. Search Filter
      const matchesSearch = !query || 
        p.title?.toLowerCase().includes(query) || 
        (typeof p.category === 'string' && p.category.toLowerCase().includes(query)) ||
        p.description?.toLowerCase().includes(query);
      
      // 2. Category Filter
      const currentCat = typeof p.category === 'string' ? p.category.trim().toLowerCase() : '';
      const matchesCategory = selectedLabels.length === 0 || selectedLabels.includes(currentCat);

      return matchesSearch && matchesCategory;
    });
  });

  activeFiltersCount = computed(() => this.programTypes().filter(t => t.selected).length);

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

  async getSubCategory(id: string) {
    this._logger.info('GET SUB CATEGORY START for ID:', id);
    try {
      const res = await lastValueFrom(
        this._programService.getProgramsByParantId(id).pipe(takeUntil(this._destroy$))
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

        // Atomic update to signals
        this.allProgramsData.set(mapped);
        this.programTypes.set(Array.from(uniqueSubCats.entries()).map(([id, name]) => ({
          label: name,
          value: id,
          selected: false
        })));
        
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

  onViewProgram(programId: string): void {
    this._logger.info('Viewing Program ID:', programId);
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
  }

  clearSearch() {
    this.searchTerm.set('');
  }

  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }

  onFilterChange(option: IProgramType) {
    this.programTypes.update(types => types.map(t => 
      t.value === option.value ? { ...t, selected: !t.selected } : t
    ));
  }

  clearAllFilters() {
    this._logger.info('CLEAR ALL FILTERS button clicked');
    this.searchTerm.set('');
    this.programTypes.update(types => types.map(t => ({ ...t, selected: false })));
    this.isFilterMenuOpen = false;
    // We can also re-trigger the fetch if we want to be paranoid
    const id = this._activatedRoute.snapshot.paramMap.get('id');
    if (id) this.getSubCategory(id);
  }

  toggleSortMenu() {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }

  onSortChange(option: any) {
    this.selectedSort = option.label;
    this.isSortMenuOpen = false;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
