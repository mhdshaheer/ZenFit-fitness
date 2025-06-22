import { Component } from '@angular/core';
import { OtpComponent } from '../../../../shared/components/otp/otp.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { OtpAccessService } from '../../services/otp-access.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup-otp',
  imports: [OtpComponent],
  templateUrl: './signup-otp.component.html',
  styleUrl: './signup-otp.component.css',
})
export class SignupOtpComponent {
  email = localStorage.getItem('signupEmail') || '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private otpService: OtpAccessService
  ) {}

  handleOtpSubmit(otp: string) {
    this.authService.verifyOtp({ email: this.email, otp }).subscribe({
      next: () => {
        Swal.fire({
          title: 'OTP verified. User registered!',
          icon: 'success',
          draggable: true,
        });
        this.router.navigate(['/user/login']);
      },
      error: (err) => {
        console.error(err.error?.message || 'Invalid OTP');
        Swal.fire({
          title: 'Invalid OTP',
          icon: 'error',
          draggable: true,
        });
      },
    });
  }
  resendOtpRequest() {
    const userData = JSON.parse(localStorage.getItem('signupFormData') || '{}');
    this.authService.sendOtp(userData).subscribe({
      next: () => {
        this.otpService.clearAccess();
        Swal.fire({
          title: 'Resent otp',
          icon: 'success',
          draggable: true,
        });
      },
      error: (err) => {
        console.error(err.error.message || 'Failed to resend OTP');
        Swal.fire({
          title: 'Failed to resend OTP',
          icon: 'error',
          draggable: true,
        });
      },
    });
  }
}
