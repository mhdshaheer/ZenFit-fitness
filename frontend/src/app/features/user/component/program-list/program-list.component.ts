import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FitnessProgram } from '../../../trainer/components/program-list/program-list.component';
import { ProgramCardComponent } from '../../../../shared/components/program-card/program-card.component';

import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService } from '../../../../core/services/program.service';
import { lastValueFrom, Subject, takeUntil } from 'rxjs';

import { ISubCategory } from '../../../../interface/category.interface';
import { FormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../../../shared/components/search-bar/search-bar.component';

interface IProgramType {
  label: string;
  value: string;
  selected: boolean;
}
@Component({
  selector: 'app-program-list',
  imports: [
    ProgramCardComponent,
    FormsModule,
    SearchBarComponent
],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnDestroy, OnInit {
  searchTerm = '';
  selectedFilter = 'All Programs';
  activeFiltersCount = 0;
  isFilterMenuOpen = false;
  isSortMenuOpen = false;
  selectedSort = 'Latest';
  filteredResultsCount = 52;
  programs: FitnessProgram[] = [];
  subcategories: ISubCategory[] = [];
  programTypes: IProgramType[] = [];

  private programService = inject(ProgramService);
  private activatedRoute = inject(ActivatedRoute);
  private route = inject(Router);

  private destroy$ = new Subject<void>();

  // UI
  btn2Label = 'Purchase';
  btn2Icon =
    'M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z';
  btn2Class =
    'px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2';
  ngOnInit() {
    this.getSubCategory();
  }

  async getSubCategory() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      const res = await lastValueFrom(
        this.programService
          .getProgramsByParantId(id)
          .pipe(takeUntil(this.destroy$))
      );

      this.programs = res.programs.map((item) => {
        const categories = JSON.parse(item.category);
        const subCatName = categories.name;
        this.subcategories.push(categories);
        return { ...item, category: subCatName };
      });

      this.extractUniqueSubCategories(this.subcategories);
    } catch (err) {
      console.error('Error fetching programs:', err);
      this.programs = [];
    }
  }

  onViewProgram(programId: string): void {
    console.log('Viewing program with ID:', programId);
  }
  onSubscribeProgram(programId: string): void {
    this.route.navigate(['user/payment', programId]);
  }
  sortOptions = [
    { label: 'Latest', value: 'createdDate' },
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Duration', value: 'duration' },
  ];

  extractUniqueSubCategories(subcategories: ISubCategory[]) {
    let unique = new Set<string>();
    for (let i = 0; i < subcategories.length; i++) {
      let str = JSON.stringify(subcategories[i]);
      if (!unique.has(str)) {
        unique.add(str);
      }
    }
    let newArr = [];
    for (let item of unique) {
      newArr.push(JSON.parse(item));
    }
    this.programTypes = newArr.map((item) => {
      let obj: IProgramType = {
        label: item.name,
        value: item._id,
        selected: false,
      };
      return obj;
    });
  }

  // Search
  onSearch(text: string) {
    this.searchTerm = text;
    console.log(text);
  }
  clearSearch() {
    this.searchTerm = '';
    this.onSearch('');
  }

  // Filter
  toggleFilterMenu() {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
  }
  onFilterChange(option: IProgramType) {
    for (let item of this.programTypes) {
      if (item.value == option.value) {
        item.selected = !item.selected;
      }
    }
    console.log('filtering :', this.programTypes);
  }

  clearAllFilters() {}

  // Sorting
  toggleSortMenu() {
    this.isSortMenuOpen = !this.isSortMenuOpen;
  }
  onSortChange(option: any) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
