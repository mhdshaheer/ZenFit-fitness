import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'signup',
    loadComponent: () =>
      import('../components/signup-user/signup-user.component').then(
        (m) => m.SignupUserComponent
      ),
  },
  {
    path: 'otp',
    loadComponent: () =>
      import('../components/signup-otp/signup-otp.component').then(
        (m) => m.SignupOtpComponent
      ),
  },
];
