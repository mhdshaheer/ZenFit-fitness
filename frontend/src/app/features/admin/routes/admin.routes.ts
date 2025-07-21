import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'admin' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../components/home-admin/home-admin.component').then(
            (m) => m.HomeAdminComponent
          ),
      },
      {
        path: 'user-manage',
        loadComponent: () =>
          import('../components/user-manage/user-manage.component').then(
            (m) => m.UserManageComponent
          ),
      },
    ],
  },
];
