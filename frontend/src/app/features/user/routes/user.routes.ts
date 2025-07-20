import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'user' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../component/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
    ],
  },
];
