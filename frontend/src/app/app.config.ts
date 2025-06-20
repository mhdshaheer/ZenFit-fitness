import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { authReducer } from './shared/auth/store/auth.reducer';
import { provideEffects } from '@ngrx/effects';
import { AuthEffects } from './shared/auth/store/auth.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    // provideStoreDevtools({ maxAge: 25, logOnly: false }),
  ],
};
