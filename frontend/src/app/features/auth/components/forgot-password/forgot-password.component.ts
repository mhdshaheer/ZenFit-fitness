import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { SharedFormComponent } from '../../../../shared/components/shared-form/shared-form.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SharedFormComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent implements OnInit {
  step = 1;
  form!: FormGroup;
  otpForm!: FormGroup;
  resetForm!: FormGroup;
  submitted = false;
  email = '';
  router = inject(Router);
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  timer!: number;
  intervel: any;

  // ========= Styles ========
  buttonColor = 'text-green-600 font-semibold';
  textColor = 'text-green-600 font-semibold underline hover:text-green-700';
  // ========= *Styles ========

  isLoading = signal(false);

  ngOnInit() {
    this.startTimer();

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    });

    this.resetForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch }
    );
  }

  get f() {
    if (this.step === 1) return this.form.controls;
    if (this.step === 2) return this.otpForm.controls;
    return this.resetForm.controls;
  }

  passwordsMatch(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  sendOtp() {
    this.submitted = true;
    if (this.form.invalid) return;
    this.isLoading.set(true);
    this.authService.sendOtp(this.form.value.email).subscribe({
      next: (res) => {
        this.email = this.form.value.email;
        Swal.fire('Success', res.message, 'success');
        this.step = 2;
        this.submitted = false;
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        Swal.fire('Error', err.error?.message || 'Failed to send OTP', 'error');
      },
    });
  }

  verifyForgotOtp() {
    this.submitted = true;
    if (this.otpForm.invalid) return;
    this.isLoading.set(true);
    this.authService
      .verifyForgotOtp(this.email, this.otpForm.value.otp)
      .subscribe({
        next: () => {
          Swal.fire('OTP Verified', 'success');
          this.step = 3;
          this.submitted = false;
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          Swal.fire(
            'Invalid OTP',
            err.error?.message || 'OTP verification failed',
            'error'
          );
        },
      });
  }

  resetPassword() {
    this.submitted = true;
    if (this.resetForm.invalid) return;
    this.isLoading.set(true);
    this.authService
      .resetPassword(this.email, this.resetForm.value.password)
      .subscribe({
        next: () => {
          this.isLoading.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Password reset successful!',
            text: 'You can now log in with your new password.',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
          }).then(() => {
            this.router.navigate(['/auth/login']);
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          Swal.fire({
            icon: 'error',
            title: 'Reset Failed',
            text: err.error?.message || 'Something went wrong!',
          });
        },
      });
  }

  resendOtp() {
    this.startTimer();
    this.authService.sendOtp(this.email).subscribe({
      next: (res) => {
        this.email = this.form.value.email;
        Swal.fire('Success', res.message, 'success');
        this.step = 2;
      },
      error: (err) => {
        this.isLoading.set(false);
        Swal.fire(
          'Error',
          err.error?.message || 'Failed to resend OTP',
          'error'
        );
      },
    });
  }
  startTimer() {
    this.timer = 30;
    this.intervel = setInterval(() => {
      this.timer--;
      if (this.timer == 0) {
        clearInterval(this.intervel);
      }
    }, 1000);
  }
}
