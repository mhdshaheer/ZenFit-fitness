import { Routes } from '@angular/router';

export const TRAINER_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
];
