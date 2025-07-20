import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';

export const TRAINER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'trainer' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../components/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
    ],
  },
];
