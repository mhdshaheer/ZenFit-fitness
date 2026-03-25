import { Component, inject, OnInit } from '@angular/core';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ActionEvent, TableAction, TableColumn } from '../../../../interface/shared.interface';
import {
  CategoryService,
  ICategory,
} from '../../../../core/services/category.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { IParams } from '../../../../interface/category.interface';



@Component({
  selector: 'app-category-list',
  imports: [TableComponent, CommonModule],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
})
export class CategoryListComponent implements OnInit {
  private readonly _categoryService = inject(CategoryService);
  private readonly _logger = inject(LoggerService);
  private readonly _router = inject(Router);
  private readonly _dialog = inject(MatDialog);

  categories: ICategory[] = []; // full list from API

  // Pagination
  page = 1;
  pageSize = 5;
  totalCategories = 0;

  // Search & sort
  searchTerm = '';
  sortBy: keyof ICategory | '' = '';
  sortOrder: 'asc' | 'desc' = 'asc';

  params: IParams = {
    page: 1,
    pageSize: 5,
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'asc',
    type: 'category'
  };

  activeTab: 'category' | 'subcategory' = 'category';
  mainCategories: ICategory[] = [];
  selectedParentId: string = '';

  ngOnInit() {
    this.getCategories();
    this.getMainCategories();
  }

  getMainCategories() {
    this._categoryService.getCategories().subscribe({
      next: (res) => {
        this.mainCategories = res;
      },
      error: (err) => {
        this._logger.error('Failed to fetch main categories for select', err);
      }
    });
  }

  get dynamicColumns(): TableColumn[] {
    const baseColumns: TableColumn[] = [
      { key: 'name', label: this.activeTab === 'category' ? 'Category Name' : 'Sub-Category Name', sortable: true, width: '200px' },
    ];

    if (this.activeTab === 'subcategory') {
      baseColumns.push({
        key: 'parentName',
        label: 'Parent Category',
        width: '200px',
      });
    }

    baseColumns.push(
      { key: 'description', label: 'Description', width: '300px' },
      {
        key: 'status',
        label: 'Status',
        type: 'status',
        sortable: true,
        width: '120px',
      },
      { key: 'createdAt', label: 'Created At', type: 'date', sortable: true }
    );

    return baseColumns;
  }

  setTab(tab: 'category' | 'subcategory') {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.selectedParentId = '';
    this.page = 1;
    this.getCategories();
  }

  onParentFilterChange(event: any) {
    this.selectedParentId = event.target.value;
    this.page = 1;
    this.getCategories();
  }

  getCategories() {
    this.params.page = this.page;
    this.params.pageSize = this.pageSize;
    this.params.search = this.searchTerm;
    this.params.sortBy = this.sortBy || 'createdAt';
    this.params.sortOrder = this.sortOrder;
    this.params.type = this.activeTab;
    this.params.parantId = this.selectedParentId ? this.selectedParentId : undefined;
    this._categoryService.getCategoryTable(this.params).subscribe({
      next: (res: { total: number; data: ICategory[] }) => {
        this.totalCategories = res.total;
        this.categories = res.data.map((item) => ({
          ...item,
          status: item.isBlocked ? 'blocked' : 'active',
        }));
      },
      error: (err) => {
        this._logger.error('Failed to fetch categories', err);
      },
    });
  }

  // Table Actions
  categoryActions: TableAction<ICategory>[] = [
    { label: 'Edit', icon: 'edit', color: 'blue', action: 'edit' },
    {
      label: 'Block',
      icon: 'block',
      color: 'red',
      action: 'block',
      condition: (row) => row.isBlocked == false,
    },
    {
      label: 'Unblock',
      icon: 'unlock',
      color: 'green',
      action: 'unblock',
      condition: (row) => row.isBlocked == true,
    },
  ];

  onCategoryAction(event: ActionEvent<ICategory>) {
    if (event.action == 'edit') {
      this._router.navigate(['admin/category/', event.row._id]);
    } else if (event.action === 'block' || event.action === 'unblock') {
      const id = event.row._id;
      const isBlocked = event.action == 'block' ? true : false;

      // =================
      const dialogRef = this._dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title:
            event.action === 'block' ? 'Block ' + (this.activeTab === 'category' ? 'Category' : 'Subcategory') : 'Unblock ' + (this.activeTab === 'category' ? 'Category' : 'Subcategory'),
          message: `Are you sure you want to ${event.action} this ${this.activeTab === 'category' ? 'category' : 'subcategory'}?`,
        },
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
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
              this.getCategories();
            });
        }
      });
      // =================
    }
  }

  createCategory() {
    this._router.navigate(['/admin/category-create']);
  }

  // Search handler
  onSearchChanged(search: string) {
    this.searchTerm = search.toLowerCase();
    this.page = 1;
    this.getCategories();
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
      this.getCategories();
    }
  }

  onPageChanged(page: number) {
    this.page = page;
    this.getCategories();
  }
}
