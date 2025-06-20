import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthStatus } from '../auth/store/auth.selectors';
import { map } from 'rxjs';

// export const AuthGuard: CanActivateFn = (route, state) => {
//   const store = inject(Store);
//   const router = inject(Router);
//   const expectedRole = route.data['role'] as 'admin' | 'user' | 'trainer';
//   return store.select(selectToken).pipe(
//     map((token) => {
//       if (!token) {
//         router.navigate(['/']);
//         return false;
//       }
//       return store.select(selectRole).pipe(
//         map((role) => {
//           if (role == expectedRole) {
//             return false;
//           }
//           router.navigate(['/']);
//           return false;
//         })
//       );
//     })
//   );
// };

export const AuthGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const expectedRole = route.data['role'] as 'admin' | 'user' | 'trainer';

  return store.select(selectAuthStatus).pipe(
    map(({ token, role }) => {
      if (!token) {
        router.navigate(['/']);
        return false;
      }
      if (role !== expectedRole) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  );
};
