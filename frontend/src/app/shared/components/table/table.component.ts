import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'email' | 'date' | 'status' | 'avatar';
  width?: string;
}

export interface TableAction {
  label: string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  action: string;
  condition?: (row: any) => boolean;
}

export interface ActionEvent {
  action: string;
  row: any;
  index: number;
}

@Component({
  selector: 'app-table',
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  @Input() title: string = 'Data Table';
  @Input() subtitle: string = 'Manage your data';
  @Input() entityName: string = 'Item';
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() pageSize: number = 10;
  @Input() showAddButton: boolean = true;

  @Output() actionClicked = new EventEmitter<ActionEvent>();
  @Output() addNewClicked = new EventEmitter<void>();

  searchTerm: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage: number = 0;

  filteredData: any[] = [];
  paginatedData: any[] = [];

  ngOnInit() {
    this.filteredData = [...this.data];
    this.updatePaginatedData();
  }

  ngOnChanges() {
    this.filteredData = [...this.data];
    this.onSearch();
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredData = [...this.data];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredData = this.data.filter((row) =>
        this.columns.some((column) =>
          row[column.key]?.toString().toLowerCase().includes(searchLower)
        )
      );
    }
    this.currentPage = 0;
    this.updatePaginatedData();
  }

  onSort(columnKey: string) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    this.filteredData.sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePaginatedData();
  }

  onAction(action: string, row: any, index: number) {
    this.actionClicked.emit({ action, row, index });
  }

  onAddNew() {
    this.addNewClicked.emit();
  }

  getAvailableActions(row: any): TableAction[] {
    return this.actions.filter(
      (action) => !action.condition || action.condition(row)
    );
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePaginatedData();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePaginatedData();
    }
  }

  updatePaginatedData() {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  get startIndex(): number {
    return this.currentPage * this.pageSize;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  Math = Math;

  // Utility methods
  getCellClass(type?: string): string {
    switch (type) {
      case 'email':
        return 'text-blue-600';
      case 'status':
        return 'text-center';
      default:
        return 'text-gray-900';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'blocked':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getActionClass(color: string): string {
    switch (color) {
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      case 'green':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      case 'red':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'yellow':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500';
      default:
        return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
    }
  }

  getActionIcon(icon: string): string {
    switch (icon) {
      case 'edit':
        return 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z';
      case 'delete':
        return 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16';
      case 'block':
        return 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728';
      case 'view':
        return 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z';
      case 'unlock':
        return 'M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z';
      case 'settings':
        return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z';
      default:
        return 'M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z';
    }
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
