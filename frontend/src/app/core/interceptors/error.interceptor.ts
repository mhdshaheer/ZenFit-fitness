// import { HttpInterceptorFn } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { HttpErrorResponse } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { LoggerService } from '../services/logger.service'; // optional
// import { catchError, switchMap, throwError } from 'rxjs';
// import { AuthService } from '../services/auth.service';

// export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);
//   const logger = inject(LoggerService);
//   const authService = inject(AuthService);

//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       logger.error('HTTP Error:', error);

//       if (error.status === 401) {
//         return authService.refreshToken().pipe(
//           switchMap((success: boolean) => {
//             if (success) {
//               const retryReq = req.clone({
//                 withCredentials: true,
//               });
//               return next(retryReq);
//             } else {
//               // Refresh token invalid, logout
//               authService.logout();
//               router.navigate(['/auth/login']);
//               return throwError(() => error);
//             }
//           }),
//           catchError(() => {
//             authService.logout();
//             router.navigate(['/auth/login']);
//             return throwError(() => error);
//           })
//         );
//       }
//       return throwError(() => error);
//     })
//   );
// };

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from '../services/logger.service'; // optional
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const logger = inject(LoggerService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error('HTTP Error:', error);
      if (
        error.status === 401 &&
        !req.url.includes('/auth/login') &&
        !req.url.includes('/auth/refresh-token')
      ) {
        return authService.refreshToken().pipe(
          switchMap((success: boolean) => {
            if (success) {
              const retryReq = req.clone({
                withCredentials: true,
              });
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
      return throwError(() => error);
    })
  );
};
