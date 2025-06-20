import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'user/login', pathMatch: 'full' },
  {
    path: 'user',
    loadChildren: () => {
      return import('./modules/user/user.routes').then((m) => m.USER_ROUTES);
    },
  },
  {
    path: 'trainer',
    loadChildren: () => {
      return import('./modules/trainer/trainer.routes').then(
        (m) => m.TRAINER_ROUTES
      );
    },
  },
  {
    path: 'admin',
    loadChildren: () => {
      return import('./modules/admin/admin.routes').then((m) => m.ADMIN_ROUTES);
    },
  },
];
