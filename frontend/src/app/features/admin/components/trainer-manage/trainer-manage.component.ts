import { Component } from '@angular/core';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { User } from '../../../../shared/models/user.model';
import {
  loadUsers,
  blockUser,
  unblockUser,
  createUser,
  updateUser,
} from '../../store/admin.actions';
import { selectAllUsers, selectUserLoading } from '../../store/admin.selectors';
import { CommonModule } from '@angular/common';

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
  selector: 'app-trainer-manage',
  imports: [TableComponent, CommonModule],
  templateUrl: './trainer-manage.component.html',
  styleUrl: './trainer-manage.component.css',
})
export class TrainerManageComponent {
  users$!: Observable<User[]>;
  loading$!: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.users$ = this.store
      .select(selectAllUsers)
      .pipe(map((users) => users.filter((user) => user.role === 'trainer')));
    this.loading$ = this.store.select(selectUserLoading);
    this.store.dispatch(loadUsers());
    console.log(this.users$);
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
    {
      key: 'dob',
      label: 'Date of Birth',
      type: 'date',
      sortable: true,
      width: '140px',
    },
    { key: 'gender', label: 'Gender', sortable: true, width: '100px' },
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
    { label: 'Edit', icon: 'edit', color: 'green', action: 'edit' },
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
    { label: 'Delete', icon: 'delete', color: 'red', action: 'delete' },
  ];

  onUserAction(event: ActionEvent) {
    switch (event.action) {
      case 'edit':
        console.log('Editing user:', event.row);
        this.store.dispatch(updateUser({ user: event.row }));
        break;

      case 'block':
        console.log('Blocking user:', event.row);
        this.store.dispatch(blockUser({ id: event.row._id }));
        break;

      case 'unblock':
        console.log('Unblocking user:', event.row);
        this.store.dispatch(unblockUser({ id: event.row._id }));
        break;

      case 'delete':
        console.log('Deleting user:', event.row);
        if (confirm('Are you sure you want to delete this user?')) {
          // Implement delete action if required
        }
        break;

      case 'view':
        console.log('Viewing user:', event.row);
        break;
    }
  }

  onAddUser() {
    console.log('Adding new user');
    const newUser: Partial<User> = {
      username: 'newuser',
      email: 'new@example.com',
      dob: '2000-01-01',
      gender: 'Male',
      status: 'active',
    };
    this.store.dispatch(createUser({ user: newUser }));
  }
}
