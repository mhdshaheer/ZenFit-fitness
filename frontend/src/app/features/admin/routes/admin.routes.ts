import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { AdminLayoutComponent } from '../components/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
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
        path: 'users',
        loadComponent: () =>
          import('../components/user-manage/user-manage.component').then(
            (m) => m.UserManageComponent
          ),
      },
      {
        path: 'category',
        loadComponent: () =>
          import('../components/category-list/category-list.component').then(
            (m) => m.CategoryListComponent
          ),
      },
      {
        path: 'profile/:id',
        loadComponent: () => {
          return import(
            '../components/user-profile/user-profile.component'
          ).then((m) => m.UserProfileComponent);
        },
      },
      {
        path: 'category-create',
        loadComponent: () => {
          return import(
            '../components/category-create/category-create.component'
          ).then((m) => m.CategoryCreateComponent);
        },
      },
    ],
  },
];
