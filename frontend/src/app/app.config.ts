import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
// import { authReducer } from '../app/store/auth/auth.reducer';
import { provideEffects } from '@ngrx/effects';
// import { AuthEffects } from '../app/store/auth/auth.effects';
import { UserEffects } from './modules/admin/store/user/user.effects';
import { userReducer } from './modules/admin/store/user/user.reducer';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { authReducer } from './features/auth/store/auth.reducer';
import { AuthEffects } from './features/auth/store/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([AuthInterceptor])),
    provideStore({ auth: authReducer, user: userReducer }),
    provideEffects([AuthEffects, UserEffects]),

    // provideStoreDevtools({ maxAge: 25, logOnly: false }),
  ],
};
