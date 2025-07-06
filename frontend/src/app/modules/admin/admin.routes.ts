import { Routes } from '@angular/router';
import { AuthGuard } from '../../shared/guards/auth.guard';
import { HomeAdminComponent } from './pages/home-admin/home-admin.component';
import { UserManageComponent } from './pages/user-manage/user-manage.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'home',
    component: HomeAdminComponent,
    // canActivate: [AuthGuard],
    data: { role: 'admin' },
  },
  { path: 'list', component: UserManageComponent },
];
