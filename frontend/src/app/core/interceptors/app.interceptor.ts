import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const AppInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const logger = inject(LoggerService);

  // Clone the request to include credentials (like AuthInterceptor)
  const clonedReq = req.clone({ withCredentials: true });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error('HTTP Error:', error);

      // Handle 401 Unauthorized (except login/refresh endpoints)
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh-token')
      ) {
        // Attempt to refresh token
        return authService.refreshToken().pipe(
          switchMap((success: boolean) => {
            if (success) {
              // Retry original request with credentials
              const retryReq = req.clone({ withCredentials: true });
              return next(retryReq);
            } else {
              authService.logout();
              router.navigate(['/auth/login']);
              return throwError(() => error);
            }
          }),
          catchError(() => {
            authService.logout();
            router.navigate(['/auth/login']);
            return throwError(() => error);
          })
        );
      }

      // Other errors
      return throwError(() => error);
    })
  );
};
