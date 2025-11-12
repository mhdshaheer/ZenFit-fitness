import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';
import { ToastService } from '../services/toast.service';

export const AppInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const logger = inject(LoggerService);
  const toastservice = inject(ToastService);

  // List of public endpoints that don't require authentication
  const publicEndpoints = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh-token',
    '/auth/send-otp',
    '/auth/verify-otp',
    '/auth/verify-forgot-otp',
    '/auth/reset-password',
    '/program' // Allow public access to program list for landing page
  ];

  // Check if the request is to a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  // Only add credentials if user has a token and it's not a public endpoint
  const hasToken = !!authService.getAccessToken();
  const clonedReq = (hasToken && !isPublicEndpoint) || req.url.includes('/auth/') 
    ? req.clone({ withCredentials: true })
    : req.clone();

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error('HTTP Error:', error);

      // 403:Blocked user
      if (
        error.status === 403 &&
        error.error?.message === 'Your account has been blocked.'
      ) {
        toastservice.error('Your account has been blocked. Contact support.');
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => error);
      }

      //  401: Unauthorized - only try to refresh if user has a token
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh-token') &&
        hasToken
      ) {
        return authService.refreshToken().pipe(
          switchMap((success: boolean) => {
            if (success) {
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

      // For 401 errors on public endpoints or when no token exists, just return the error
      if (error.status === 401 && (!hasToken || isPublicEndpoint)) {
        return throwError(() => error);
      }

      // 400 or 404 : not found page
      if (error.status === 400 || error.status === 404) {
        toastservice.error('Page not found or invalid request.');
        router.navigate(['/not-found']);
        return throwError(() => error);
      }

      // 500: Internal Server Error
      if (error.status === 500) {
        toastservice.error('Something went wrong on the server.');
        router.navigate(['/error']);
        return throwError(() => error);
      }

      return throwError(() => error);
    })
  );
};
