import { HttpInterceptorFn } from '@angular/common/http';

// export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
//   const token = localStorage.getItem('accessToken');
//   if (token) {
//     const cloned = req.clone({
//       headers: req.headers.set('Authorization', `Bearer ${token}`),
//       withCredentials: true, // ✅ Include if using refresh token cookies
//     });
//     return next(cloned);
//   }
//   return next(req);
// };

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    withCredentials: true, // ✅ include cookies (access token)
  });
  return next(cloned);
};
