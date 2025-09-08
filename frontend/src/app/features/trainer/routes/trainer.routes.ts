import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { TrainerLayoutComponent } from '../components/trainer-layout/trainer-layout.component';

export const TRAINER_ROUTES: Routes = [
  {
    path: '',
    component: TrainerLayoutComponent,
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
      {
        path: 'profile',
        loadComponent: () => {
          return import(
            '../components/trainer-profile/trainer-profile.component'
          ).then((m) => m.TrainerProfileComponent);
        },
      },
      {
        path: 'program-create',
        loadComponent: () => {
          return import(
            '../components/program-create/program-create.component'
          ).then((m) => m.ProgramCreateComponent);
        },
      },
      {
        path: 'programs',
        loadComponent: () => {
          return import(
            '../components/program-list/program-list.component'
          ).then((m) => m.ProgramListComponent);
        },
      },
    ],
  },
];
