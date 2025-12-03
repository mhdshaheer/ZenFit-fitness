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
      {
        path: 'programs/:id/users',
        loadComponent: () => {
          return import(
            '../components/program-users/program-users.component'
          ).then((m) => m.ProgramUsersComponent);
        },
      },

      {
        path: 'program/:id',
        loadComponent: () => {
          return import(
            '../components/program-view/program-view.component'
          ).then((m) => m.ProgramViewComponent);
        },
      },

      {
        path: 'wallet',
        loadComponent: () => {
          return import(
            '../components/trainer-wallet/trainer-wallet.component'
          ).then((m) => m.TrainerWalletComponent);
        },
      },
      {
        path: 'slots',
        loadComponent: () => {
          return import('../components/create-slot/create-slot.component').then(
            (m) => m.CreateSlotComponent
          );
        },
      },
      {
        path: 'purchased-programs',
        loadComponent: () => {
          return import(
            '../components/purchased-programs/purchased-programs.component'
          ).then((m) => m.PurchasedProgramsComponent);
        },
      },
      {
        path: 'chat',
        loadComponent: () => {
          return import('../components/trainer-chat/trainer-chat.component').then(m => m.TrainerChatComponent)
        }
      },
      {
        path: 'sessions',
        loadComponent: () => {
          return import('../components/trainer-sessions/trainer-sessions.component').then(
            (m) => m.TrainerSessionsComponent
          );
        },
      }

    ],
  },
];
