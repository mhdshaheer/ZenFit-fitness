import { Routes } from '@angular/router';
import { OtpGuard } from '../../../core/guards/otp.guard';

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
    canActivate: [OtpGuard],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('../components/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
];
