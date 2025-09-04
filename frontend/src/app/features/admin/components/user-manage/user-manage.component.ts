import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { TableComponent } from '../../../../shared/components/table/table.component';
import { User } from '../../../../shared/models/user.model';
import { loadUsers, updateUserStatus } from '../../store/admin.actions';
import {
  selectAllUsers,
  selectTotalUsers,
  selectUserLoading,
} from '../../store/admin.selectors';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

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
  condition?: (row: User) => boolean;
}

export interface ActionEvent {
  action: string;
  row: User;
  index: number;
}

@Component({
  selector: 'app-user-manage',
  standalone: true,
  imports: [TableComponent, CommonModule],
  templateUrl: './user-manage.component.html',
  styleUrl: './user-manage.component.css',
})
export class UserManageComponent implements OnInit {
  private store = inject(Store);
  private dialog = inject(MatDialog);

  users$!: Observable<User[]>;
  loading$!: Observable<boolean>;

  // Pagination and filtering state
  page = 1;
  pageSize = 5;
  totalUsers = 0;
  search = '';
  sortBy = 'createdAt';
  sortOrder: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.users$ = this.store.select(selectAllUsers);
    this.store.select(selectTotalUsers).subscribe((total) => {
      console.log('total users: ', total);
      this.totalUsers = total;
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
    this.page = page;
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
    const { action, row } = event;
    if (action == 'view') {
      console.log('viewing user info..');
      return;
    }
    if (action == 'block' || action == 'unblock') {
      const updatedStatus = row.status == 'active' ? 'blocked' : 'active';
      const user_Id = row._id || row.id;

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '350px',
        data: {
          title: action === 'block' ? 'Block User' : 'Unblock User',
          message: `Are you sure you want to ${action} this user?`,
        },
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.store.dispatch(
            updateUserStatus({
              id: user_Id,
              status: updatedStatus,
            })
          );
        }
      });
    }
  }
}
