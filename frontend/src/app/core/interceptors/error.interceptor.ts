// src/app/core/interceptors/error.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service'; // optional
import { catchError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error('HTTP Error:', error);

      if (error.status === 401) {
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        alert('You do not have permission to perform this action.');
      } else if (error.status === 404) {
        alert('Resource not found.');
      } else if (error.status >= 500) {
        alert('A server error occurred. Please try again later.');
      } else {
        alert(error?.error?.message || 'An unexpected error occurred.');
      }
      throw error;
    })
  );
};
