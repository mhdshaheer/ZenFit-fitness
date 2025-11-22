import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  canActivate(route: ActivatedRouteSnapshot) {
    const expectedRole = route.data['role'];
    const userRole = this._authService.getUserRole();
    if (userRole === expectedRole) {
      return true;
    } else {
      this._router.navigate(['/not-authorized']);
      return false;
    }
  }
}
