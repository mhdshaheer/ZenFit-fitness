import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => {
      return import(
        '../app/features/user/component/landing-page/landing-page.component'
      ).then((m) => m.LandingPageComponent);
    },
    pathMatch: 'full',
  },
  {
    path: 'auth',
    loadChildren: () => {
      return import('../app/features/auth/routes/auth.routes').then(
        (m) => m.AUTH_ROUTES
      );
    },
  },
  {
    path: 'user',
    loadChildren: () =>
      import('../app/features/user/routes/user.routes').then(
        (m) => m.USER_ROUTES
      ),
  },

  {
    path: 'trainer',
    loadChildren: () =>
      import('../app/features/trainer/routes/trainer.routes').then(
        (m) => m.TRAINER_ROUTES
      ),
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/routes/admin.routes').then(
        (m) => m.ADMIN_ROUTES
      ),
  },
  // {
  //   path: '**',
  //   // path: 'not-authorized',
  //   loadComponent: () =>
  //     import('../app/shared/components/not-found/not-found.component').then(
  //       (m) => m.NotFoundComponent
  //     ),
  // },
];
