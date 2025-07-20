import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OtpAccessService } from '../services/otp-access.service';

@Injectable({ providedIn: 'root' })
export class OtpGuard implements CanActivate {
  private otpAccess = inject(OtpAccessService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.otpAccess.canAccess()) {
      return true;
    } else {
      this.router.navigate(['/auth/signup']);
      return false;
    }
  }
}
