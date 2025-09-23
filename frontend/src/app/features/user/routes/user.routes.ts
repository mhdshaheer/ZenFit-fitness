import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { UserLayoutComponent } from '../component/user-layout/user-layout.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    // canActivate: [AuthGuard, RoleGuard],
    component: UserLayoutComponent,
    data: { role: 'user' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../component/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'profile',
        loadComponent() {
          return import(
            '../component/user-profile/user-profile.component'
          ).then((m) => m.UserProfileComponent);
        },
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'workouts',
        loadComponent: () => {
          return import(
            '../component/program-category-list/program-category-list.component'
          ).then((m) => m.ProgramCategoryListComponent);
        },
      },
      {
        path: 'programs/:id',
        loadComponent: () =>
          import('../component/program-list/program-list.component').then(
            (m) => m.ProgramListComponent
          ),
      },
    ],
  },
];
