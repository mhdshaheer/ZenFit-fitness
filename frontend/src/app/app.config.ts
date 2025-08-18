import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
// import { authReducer } from '../app/store/auth/auth.reducer';
import { provideEffects } from '@ngrx/effects';
// import { AuthEffects } from '../app/store/auth/auth.effects';

import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './features/auth/store/auth.reducer';
import { AuthEffects } from './features/auth/store/auth.effects';
import {
  GoogleLoginProvider,
  SocialAuthServiceConfig,
  SocialLoginModule,
} from '@abacritt/angularx-social-login';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { adminReducer } from './features/admin/store/admin.reducer';
import { AdminEffects } from './features/admin/store/admin.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor, ErrorInterceptor])),
    provideStore({ auth: authReducer, admin: adminReducer }),
    provideEffects([AuthEffects, AdminEffects]),
    provideAnimations(),
    importProvidersFrom(SocialLoginModule),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '620077390892-2m9pultqmnbj8bvumdjvtmtkp9006anh.apps.googleusercontent.com'
            ),
          },
        ],
      } as SocialAuthServiceConfig,
    },
    // provideStoreDevtools({ maxAge: 25, logOnly: false }),
  ],
};
