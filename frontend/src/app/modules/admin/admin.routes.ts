import { Routes } from '@angular/router';
import { LoginAdminComponent } from './pages/login-admin/login-admin.component';
import { AuthGuard } from '../../shared/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginAdminComponent,
  },
  // {
  //   path: 'dashboard',
  //   component: AdminComponent,
  //   canActivate: [AuthGuard],
  //   data: { role: 'admin' },
  // },
];
