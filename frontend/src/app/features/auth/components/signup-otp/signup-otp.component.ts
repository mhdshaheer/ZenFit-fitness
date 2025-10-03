import { Component, inject, OnDestroy } from '@angular/core';
import { OtpComponent } from '../../../../shared/components/otp/otp.component';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { OtpAccessService } from '../../../../core/services/otp-access.service';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoggerService } from '../../../../core/services/logger.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-signup-otp',
  standalone: true,
  imports: [OtpComponent],
  templateUrl: './signup-otp.component.html',
  styleUrl: './signup-otp.component.css',
})
export class SignupOtpComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private logger = inject(LoggerService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private otpService = inject(OtpAccessService);
  private toastService = inject(ToastService);

  email = localStorage.getItem('signupEmail') || '';

  handleOtpSubmit(otp: string) {
    if (!this.email) {
      this.logger.error('Email is missing.');
      return;
    }

    if (!otp || otp.length !== 6) {
      Swal.fire({
        title: 'Please enter a valid 6-digit OTP.',
        icon: 'warning',
      });
      return;
    }

    this.authService
      .verifyOtp(this.email!, otp)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('userRole', res.role);
          Swal.fire({
            title: 'OTP verified. User registered!',
            icon: 'success',
            draggable: true,
          }).then(() => {
            this.otpService.clearAccess();
            this.router.navigate([`/${res.role}/dashboard`]);
          });
        },
        error: (err) => {
          this.logger.error('Invalid OTP', err);
          this.toastService.error('Invalid OTP');
        },
      });
  }
  resendOtpRequest() {
    if (!this.email) return;
    this.authService
      .resentOtp(this.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (_res) => {
          this.toastService.success('OTP resent');
        },
        error: (_err) => {
          this.toastService.error('Failed to resend OTP');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
