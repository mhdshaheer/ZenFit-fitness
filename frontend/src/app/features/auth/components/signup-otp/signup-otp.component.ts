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
  private _destroy$ = new Subject<void>();
  private _logger = inject(LoggerService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _otpService = inject(OtpAccessService);
  private _toastService = inject(ToastService);

  email = localStorage.getItem('signupEmail') || '';

  handleOtpSubmit(otp: string) {
    if (!this.email) {
      this._logger.error('Email is missing.');
      return;
    }

    if (!otp || otp.length !== 6) {
      Swal.fire({
        title: 'Please enter a valid 6-digit OTP.',
        icon: 'warning',
      });
      return;
    }

    this._authService
      .verifyOtp(this.email!, otp)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          localStorage.setItem('accessToken', res.accessToken);
          localStorage.setItem('userRole', res.role);
          Swal.fire({
            title: 'OTP verified. User registered!',
            icon: 'success',
            draggable: true,
          }).then(() => {
            this._otpService.clearAccess();
            this._router.navigate([`/${res.role}/dashboard`]);
          });
        },
        error: (err) => {
          this._logger.error('Invalid OTP', err);
          this._toastService.error('Invalid OTP');
        },
      });
  }
  resendOtpRequest() {
    if (!this.email) return;
    this._authService
      .resentOtp(this.email)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (_res) => {
          this._toastService.success('OTP resent');
        },
        error: (_err) => {
          this._toastService.error('Failed to resend OTP');
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
