import { Routes } from '@angular/router';
import { AuthGuard } from '../../../core/guards/auth.guard';
import { RoleGuard } from '../../../core/guards/role.guard';
import { UserLayoutComponent } from '../component/user-layout/user-layout.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
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
      {
        path: 'payment/:id',
        loadComponent: () => {
          return import('../component/payment/payment.component').then(
            (m) => m.PaymentComponent
          );
        },
      },
      {
        path: 'payment-success',
        loadComponent: () => {
          return import(
            '../component/payment-success/payment-success.component'
          ).then((m) => m.PaymentSuccessComponent);
        },
      },
      {
        path: 'payment-failed',
        loadComponent: () => {
          return import(
            '../component/payment-failed/payment-failed.component'
          ).then((m) => m.PaymentFailedComponent);
        },
      },
      {
        path: 'slots/:programId',
        loadComponent: () => {
          return import('../component/slot-list/slot-list.component').then(
            (m) => m.SlotListComponent
          );
        },
      },
      {
        path: 'my-programs',
        loadComponent: () => {
          return import(
            '../component/purchased-programs/purchased-programs.component'
          ).then((m) => m.PurchasedProgramsComponent);
        },
      },
      {
        path: 'booked-slots',
        loadComponent: () => {
          return import(
            '../component/booked-slots/booked-slots.component'
          ).then((m) => m.BookedSlotsComponent);
        },
      },
      {
        path: 'program-details/:programId',
        loadComponent: () => {
          return import(
            '../component/program-details/program-details.component'
          ).then((m) => m.ProgramDetailsComponent);
        },
      },
      {
        path: 'chat/:programId',
        loadComponent: () =>
          import('../component/user-chat/user-chat.component').then(
            (m) => m.UserChatComponent
          ),
      },
    ],
  },
];
