import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoggedInRedirectGuard implements CanActivate {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this._authService.isLoggedIn();
    
    if (isLoggedIn) {
      let role = this._authService.getUserRole();
      
      // If role is missing in localStorage but user is logged in, try fetching it
      if (!role) {
        try {
          const profile = await firstValueFrom(this._authService.getUserProfile());
          role = profile.role;
          localStorage.setItem('userRole', role);
        } catch {
          // Fallback to user if profile fetch fails
          role = 'user';
        }
      }

      if (role === 'admin') {
        this._router.navigate(['/admin/dashboard']);
      } else if (role === 'trainer') {
        this._router.navigate(['/trainer/dashboard']);
      } else {
        this._router.navigate(['/user/dashboard']);
      }
      return false;
    }
    
    return true;
  }
}
