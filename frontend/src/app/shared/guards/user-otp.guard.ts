import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { OtpAccessService } from '../../core/services/otp-access.service';

@Injectable({
  providedIn: 'root',
})
export class OtpGuard implements CanActivate {
  constructor(private otpService: OtpAccessService, private router: Router) {}

  canActivate(): boolean {
    if (this.otpService.canAccess()) {
      return true;
    } else {
      this.router.navigate(['/user/signup']);
      return false;
    }
  }
}
