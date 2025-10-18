import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private _authService = inject(AuthService);
  private _router = inject(Router);
  async canActivate(): Promise<boolean> {
    if (await this._authService.isLoggedIn()) {
      return true;
    } else {
      this._router.navigate(['/auth/login']);
      return false;
    }
  }
}
