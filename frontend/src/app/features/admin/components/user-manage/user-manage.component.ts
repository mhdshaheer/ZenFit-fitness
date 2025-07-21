import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { TableComponent } from '../../../../shared/components/table/table.component';
import { User } from '../../../../shared/models/user.model';
import { loadUsers, updateUserStatus } from '../../store/admin.actions';
import { selectAllUsers, selectUserLoading } from '../../store/admin.selectors';

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
  selector: 'app-user-manage',
  standalone: true,
  imports: [TableComponent, CommonModule],
  templateUrl: './user-manage.component.html',
  styleUrl: './user-manage.component.css',
})
export class UserManageComponent {
  private store = inject(Store);

  users$!: Observable<User[]>;
  loading$!: Observable<boolean>;

  // Pagination and filtering state
  page = 1;
  pageSize = 10;
  totalUsers: number = 0;
  search = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.users$ = this.store.select(selectAllUsers);
    this.store.select(selectAllUsers).subscribe((users) => {
      this.totalUsers = users.length;
    });
    this.loading$ = this.store.select(selectUserLoading);
    this.loadUsersFromBackend();
  }

  loadUsersFromBackend(): void {
    this.store.dispatch(
      loadUsers({
        page: this.page,
        pageSize: this.pageSize,
        search: this.search,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder,
      })
    );
  }

  onSearchChanged(search: string) {
    this.search = search;
    this.page = 1; // reset page
    this.loadUsersFromBackend();
  }

  onPageChanged(page: number) {
    this.page = page + 1;
    this.loadUsersFromBackend();
  }

  onSortChanged({
    sortBy,
    sortOrder,
  }: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }) {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.loadUsersFromBackend();
  }

  userColumns: TableColumn[] = [
    { key: 'username', label: 'Username', sortable: true, width: '180px' },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      sortable: true,
      width: '220px',
    },
    { key: 'role', label: 'Role', sortable: true, width: '100px' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
      width: '120px',
    },
  ];

  userActions: TableAction[] = [
    { label: 'View', icon: 'view', color: 'blue', action: 'view' },
    {
      label: 'Block',
      icon: 'block',
      color: 'red',
      action: 'block',
      condition: (row) => row.status === 'active',
    },
    {
      label: 'Unblock',
      icon: 'unlock',
      color: 'green',
      action: 'unblock',
      condition: (row) => row.status === 'blocked',
    },
  ];

  onUserAction(event: ActionEvent) {
    switch (event.action) {
      case 'block':
      case 'unblock':
        const newStatus = event.row.status === 'active' ? 'blocked' : 'active';
        this.store.dispatch(
          updateUserStatus({
            id: event.row._id,
            status: newStatus,
          })
        );
        break;
      case 'view':
        console.log('Viewing user:', event.row);
        break;
    }
  }
}
