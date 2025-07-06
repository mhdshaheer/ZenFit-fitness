import { Component } from '@angular/core';
import { OtpComponent } from '../../../../shared/components/otp/otp.component';
import { TrainerAuthService } from '../../services/trainer-auth.service';
import { Router } from '@angular/router';
import { TrainerOtpService } from '../../services/trainer-otp.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup-trainer-otp',
  standalone: true,
  imports: [OtpComponent],
  templateUrl: './signup-trainer-otp.component.html',
  styleUrl: './signup-trainer-otp.component.css',
})
export class SignupTrainerOtpComponent {
  email = localStorage.getItem('trainerEmail') || '';
  constructor(
    private authService: TrainerAuthService,
    private router: Router,
    private otpService: TrainerOtpService
  ) {}

  handleOtpSubmit(otp: string) {
    this.authService.verifyOtp({ email: this.email, otp }).subscribe({
      next: () => {
        Swal.fire({
          title: 'OTP verified. User registered!',
          icon: 'success',
          draggable: true,
        });
        this.router.navigate(['/trainer/login']);
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
    // const userData = JSON.parse(localStorage.getItem('signupFormData') || '{}');
    // this.authService.sendOtp(userData).subscribe({
    //   next: () => {
    //     this.otpService.clearAccess();
    //     Swal.fire({
    //       title: 'Resent otp',
    //       icon: 'success',
    //       draggable: true,
    //     });
    //   },
    //   error: (err) => {
    //     console.error(err.error.message || 'Failed to resend OTP');
    //     Swal.fire({
    //       title: 'Failed to resend OTP',
    //       icon: 'error',
    //       draggable: true,
    //     });
    //   },
    // });
    console.log('resend..');
  }
}
