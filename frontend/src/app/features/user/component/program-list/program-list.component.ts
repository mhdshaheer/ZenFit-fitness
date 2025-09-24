import { Component, inject, OnDestroy } from '@angular/core';
import { FitnessProgram } from '../../../trainer/components/program-list/program-list.component';
import { ProgramCardComponent } from '../../../../shared/components/program-card/program-card.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProgramService } from '../../../../core/services/program.service';
import { Program } from '../../../trainer/store/trainer.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-program-list',
  imports: [ProgramCardComponent, CommonModule],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnDestroy {
  programService = inject(ProgramService);
  route = inject(ActivatedRoute);

  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.getSubCategory();
  }
  programs: FitnessProgram[] = [];

  getSubCategory() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return; // safety check

    this.programService
      .getProgramsByParantId(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: { programs: Program[] }) => {
          console.log('Programs response:', res.programs);
          this.programs = res.programs.map((item) => {
            let category = JSON.parse(item.category).name;
            console.log('Category :', category);
            return { ...item, category: category };
          });
        },
        error: (err) => {
          console.error('Error fetching programs:', err);
          this.programs = [];
        },
      });
  }

  onViewProgram(programId: string): void {
    console.log('Viewing program with ID:', programId);
  }

  onEditProgram(programId: string): void {
    console.log('Editing program with ID:', programId);
  }
  // Properties for UI binding
  searchTerm: string = '';
  selectedFilter: string = 'All Programs';
  activeFiltersCount: number = 0;
  isFilterMenuOpen: boolean = false;
  isSortMenuOpen: boolean = false;
  selectedSort: string = 'Created Date';
  selectedDuration: string = '';
  filteredResultsCount: number = 52;
  dateRange = { from: '', to: '' };

  // Sample data for dropdowns
  statusOptions = [
    { label: 'Active', value: 'active', selected: false, count: 24 },
    { label: 'Inactive', value: 'inactive', selected: false, count: 8 },
    { label: 'Draft', value: 'draft', selected: false, count: 5 },
    { label: 'Completed', value: 'completed', selected: false, count: 12 },
    { label: 'Archived', value: 'archived', selected: false, count: 3 },
  ];

  programTypes = [
    { label: 'Weight Training', value: 'weight', selected: false, count: 18 },
    { label: 'Cardio', value: 'cardio', selected: false, count: 15 },
    { label: 'HIIT', value: 'hiit', selected: false, count: 10 },
    { label: 'Yoga', value: 'yoga', selected: false, count: 8 },
    { label: 'Pilates', value: 'pilates', selected: false, count: 6 },
    { label: 'CrossFit', value: 'crossfit', selected: false, count: 12 },
    { label: 'Swimming', value: 'swimming', selected: false, count: 4 },
  ];

  durationOptions = [
    { label: 'All Durations', value: '', selected: true, count: 52 },
    { label: '1-4 weeks', value: '1-4', selected: false, count: 15 },
    { label: '1-3 months', value: '1-3', selected: false, count: 22 },
    { label: '3-6 months', value: '3-6', selected: false, count: 12 },
    { label: '6+ months', value: '6+', selected: false, count: 3 },
  ];

  sortOptions = [
    { label: 'Created Date', value: 'createdDate' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Duration', value: 'duration' },
    { label: 'Status', value: 'status' },
    { label: 'Last Modified', value: 'lastModified' },
  ];

  activeFilterTags = ['abx', 'abc', 'aaa'];

  // Computed property
  get hasActiveFilters(): boolean {
    return this.activeFiltersCount > 0;
  }

  // Methods called by template (empty implementations)
  onSearch(event: any) {}
  clearSearch() {}
  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }
  onFilterChange(type: string, option: any) {}
  onDateRangeChange() {}
  clearAllFilters() {}
  resetFilters() {}
  applyFilters() {}
  removeFilter(filter: any) {}
  toggleSortMenu() {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }
  onSortChange(option: any) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
