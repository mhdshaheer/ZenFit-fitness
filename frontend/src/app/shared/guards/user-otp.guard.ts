import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OtpAccessService } from '../../core/services/otp-access.service';

@Injectable({
  providedIn: 'root',
})
export class OtpGuard implements CanActivate {
  private otpService = inject(OtpAccessService);
  private router = inject(Router);


  canActivate(): boolean {
    if (this.otpService.canAccess()) {
      return true;
    } else {
      this.router.navigate(['/user/signup']);
      return false;
    }
  }
}
