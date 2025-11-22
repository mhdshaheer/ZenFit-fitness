import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OtpAccessService } from '../services/otp-access.service';

@Injectable({ providedIn: 'root' })
export class OtpGuard implements CanActivate {
  private readonly _otpAccess = inject(OtpAccessService);
  private readonly _router = inject(Router);

  canActivate(): boolean {
    if (this._otpAccess.canAccess()) {
      return true;
    } else {
      this._router.navigate(['/auth/signup']);
      return false;
    }
  }
}
