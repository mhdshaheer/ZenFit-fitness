import { Component } from '@angular/core';
import { TableComponent } from '../../../../shared/components/table/table.component';

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
export class CategoryListComponent {
  // Pagination
  page = 1;
  pageSize = 5;
  totalCategories = 8;

  // Dummy Category Data
  categories = [
    {
      _id: '1',
      name: 'Strength Training',
      description: 'Workouts to build strength and endurance',
      parentId: null,
      createdAt: '2024-01-01',
      status: 'active',
    },
    {
      _id: '2',
      name: 'Powerlifting',
      description: 'Heavy lifting subcategory under strength',
      parentId: '1',
      createdAt: '2024-02-01',
      status: 'active',
    },
    {
      _id: '3',
      name: 'Cardio & Endurance',
      description: 'Improve stamina with cardio programs',
      parentId: null,
      createdAt: '2024-01-15',
      status: 'active',
    },
    {
      _id: '4',
      name: 'Running',
      description: 'Subcategory under Cardio',
      parentId: '3',
      createdAt: '2024-02-10',
      status: 'inactive',
    },
    {
      _id: '5',
      name: 'Cycling',
      description: 'Subcategory under Cardio',
      parentId: '3',
      createdAt: '2024-02-12',
      status: 'active',
    },
  ];

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
