import { Component, inject, OnInit } from '@angular/core';
import { TableComponent } from '../../../../shared/components/table/table.component';
import {
  CategoryService,
  ICategory,
} from '../../../../core/services/category.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Router } from '@angular/router';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'status';
  width?: string;
}

export interface TableAction {
  label: string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  action: string;
  condition?: (row: ICategory) => boolean;
}

export interface ActionEvent {
  action: string;
  row: any;
  index: number;
}

@Component({
  selector: 'app-category-list',
  imports: [TableComponent],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  private _categoryService = inject(CategoryService);
  private _logger = inject(LoggerService);
  private _router = inject(Router);

  categories: ICategory[] = []; // full list from API
  filteredCategories: ICategory[] = []; // filtered + sorted list

  // Pagination
  page = 1;
  pageSize = 5;
  totalCategories = 0;

  // Search & sort
  searchTerm = '';
  sortBy: keyof ICategory | '' = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  ngOnInit() {
    this.getCategories();
  }

  categoryColumns: TableColumn[] = [
    { key: 'name', label: 'Category Name', sortable: true, width: '200px' },
    { key: 'description', label: 'Description', width: '300px' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
      width: '120px',
    },
    { key: 'createdAt', label: 'Created At', type: 'date', sortable: true },
  ];

  getCategories() {
    this._categoryService.getCategories().subscribe({
      next: (res: ICategory[]) => {
        this.categories = res.map((item) => ({
          ...item,
          status: item.isBlocked ? 'blocked' : 'active',
        }));
        this.applyFilterAndSort();
      },
      error: (err) => {
        this._logger.error('Failed to fetch categories', err);
      },
    });
  }

  // Table Actions
  categoryActions: TableAction[] = [
    { label: 'Edit', icon: 'edit', color: 'blue', action: 'edit' },
    {
      label: 'Block',
      icon: 'block',
      color: 'red',
      action: 'block',
      condition: (row) => row.isBlocked == false,
    },
    {
      label: 'Ubblock',
      icon: 'unlock',
      color: 'green',
      action: 'unblock',
      condition: (row) => row.isBlocked == true,
    },
  ];

  onCategoryAction(event: ActionEvent) {
    if (event.action == 'edit') {
      this._router.navigate(['admin/category/', event.row._id]);
    } else if (event.action === 'block' || event.action === 'unblock') {
      let id = event.row._id;
      let isBlocked = event.action == 'block' ? true : false;
      this._categoryService
        .updateStatus(id, isBlocked)
        .subscribe((updatedCategory) => {
          this.categories = this.categories.map((item) =>
            item._id === id
              ? {
                  ...updatedCategory,
                  status: updatedCategory.isBlocked ? 'blocked' : 'active',
                }
              : item
          );
          this.applyFilterAndSort();
        });
    }
  }

  createCategory() {
    this._router.navigate(['/admin/category-create']);
  }

  // Search handler
  onSearchChanged(search: string) {
    this.searchTerm = search.toLowerCase();
    this.applyFilterAndSort();
  }

  // Sort handler
  onSortChanged({
    sortBy,
    sortOrder,
  }: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    if (sortBy) {
      this.sortBy = sortBy as keyof ICategory;
      this.sortOrder = sortOrder;
      this.applyFilterAndSort();
    }
  }

  // Apply search + sort
  private applyFilterAndSort() {
    let list = [...this.categories];

    // Filter
    if (this.searchTerm) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(this.searchTerm) ||
          (c.description &&
            c.description.toLowerCase().includes(this.searchTerm))
      );
    }

    // Sort
    if (this.sortBy) {
      list.sort((a, b) => {
        const valA = a[this.sortBy as keyof ICategory];
        const valB = b[this.sortBy as keyof ICategory];

        if (valA == null) return 1;
        if (valB == null) return -1;

        let comparison = 0;
        if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else if (valA instanceof Date && valB instanceof Date) {
          comparison = valA.getTime() - valB.getTime();
        } else {
          comparison = valA > valB ? 1 : -1;
        }

        return this.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    this.filteredCategories = list;
    this.totalCategories = list.length;
  }

  onPageChanged(page: number) {
    this.page = page;
  }
}
