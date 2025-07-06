import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../component/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
];
