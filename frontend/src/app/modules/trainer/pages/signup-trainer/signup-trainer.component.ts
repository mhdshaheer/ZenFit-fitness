import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TrainerAuthService } from '../../services/trainer-auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-trainer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup-trainer.component.html',
  styleUrl: './signup-trainer.component.css',
})
export class SignupTrainerComponent {
  signupForm!: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  constructor(
    private fb: FormBuilder,
    private trainerAuthService: TrainerAuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
        experience: [
          '',
          [Validators.required, Validators.min(1), Validators.max(50)],
        ],
        languages: ['', Validators.required],
      },
      {
        validators: [this.passwordMatchValidator],
      }
    );
  }

  get f() {
    return this.signupForm.controls;
  }
  passwordToggleVisibility() {
    this.showPassword = !this.showPassword;
  }

  confirmPasswordToggleVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  onSubmit(): void {
    if (this.signupForm.valid) {
      let trainerFormData = this.signupForm.value;
      this.trainerAuthService.sendOtp(trainerFormData).subscribe({
        next: (res) => {
          console.log('Trainer signup successfull ', res);
          localStorage.setItem('trainerEmail', trainerFormData.email);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Otp sent',
            showConfirmButton: false,
            timer: 1500,
          }).then(() => {
            // this.otpService.allowAccess();
            this.router.navigate(['/trainer/otp']);
          });
        },
        error: (err) => {
          console.log('Trainer signup failed ', err);
        },
      });
      console.log('Trainer Form Submitted:', this.signupForm.value);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
