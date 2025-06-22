import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TrainerOtpService } from '../../modules/trainer/services/trainer-otp.service';

@Injectable({
  providedIn: 'root',
})
export class TrainerOtpGuard implements CanActivate {
  constructor(private otpService: TrainerOtpService, private router: Router) {}

  canActivate(): boolean {
    if (this.otpService.canAccess()) {
      return true;
    } else {
      this.router.navigate(['/trainer/signup']);
      return false;
    }
  }
}
