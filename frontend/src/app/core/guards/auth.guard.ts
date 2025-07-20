import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  async canActivate(): Promise<boolean> {
    if (await this.authService.isLoggedIn()) {
      console.log(await this.authService.isLoggedIn());
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
