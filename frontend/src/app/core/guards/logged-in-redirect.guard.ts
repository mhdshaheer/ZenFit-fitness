import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoggedInRedirectGuard implements CanActivate {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this._authService.isLoggedIn();
    
    if (isLoggedIn) {
      const role = this._authService.getUserRole();
      if (role === 'admin') {
        this._router.navigate(['/admin']);
      } else if (role === 'trainer') {
        this._router.navigate(['/trainer']);
      } else {
        this._router.navigate(['/user']);
      }
      return false;
    }
    
    return true;
  }
}
