import { Component, inject, OnInit } from '@angular/core';
import { TableComponent } from '../../../../shared/components/table/table.component';
import {
  CategoryService,
  ICategory,
} from '../../../../core/services/category.service';
import { LoggerService } from '../../../../core/services/logger.service';

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
  // condition?: (row: any) => boolean;
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
  // Service
  private _categoryService = inject(CategoryService);
  private _logger = inject(LoggerService);

  categories: ICategory[] = [];

  // Pagination
  page = 1;
  pageSize = 5;
  totalCategories = 8;

  ngOnInit() {
    this.getCategories();
  }

  // Table Columns
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
        this.categories = res.map((item) => {
          let status: 'active' | 'blocked' = item.isBlocked
            ? 'blocked'
            : 'active';
          let obj: ICategory = { ...item, status: status };
          return obj;
        });
      },
      error: (err) => {
        this._logger.error('Failed to fetch categories', err);
      },
    });
  }

  // Table Actions
  categoryActions: TableAction[] = [
    { label: 'Edit', icon: 'edit', color: 'blue', action: 'edit' },
    { label: 'Delete', icon: 'delete', color: 'red', action: 'delete' },
  ];

  // Event handlers
  onCategoryAction(event: ActionEvent) {
    console.log('Category action clicked:', event);
  }

  onSearchChanged(search: string) {
    console.log('Searching for:', search);
  }

  onPageChanged(page: number) {
    this.page = page;
    console.log('Page changed:', page);
  }

  onSortChanged({
    sortBy,
    sortOrder,
  }: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    console.log('Sorting by:', sortBy, 'Order:', sortOrder);
  }
  createCategory() {
    console.log('create category clicked...');
  }
}
