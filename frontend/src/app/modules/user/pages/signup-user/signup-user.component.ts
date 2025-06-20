import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup-user.component.html',
  styleUrl: './signup-user.component.css',
})
export class SignupUserComponent {
  signupForm!: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.signupForm = this.fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(20),
            Validators.pattern(/^[a-zA-Z0-9_]+$/),
          ],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern(
              /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            ),
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
        confirmPassword: ['', [Validators.required]],
        dob: ['', [Validators.required, this.dobValidator]],
        gender: ['', [Validators.required]],
      },
      {
        validators: [this.passwordMatchValidator],
      }
    );
  }
  passwordToggleVisibility() {
    this.showPassword = !this.showPassword;
  }
  confirmPasswordToggleVisibily() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  dobValidator(control: AbstractControl) {
    const dob = new Date(control.value);
    const today = new Date();

    if (isNaN(dob.getTime())) {
      return { invalidDate: true }; // not a valid date
    }

    if (dob > today) {
      return { futureDate: true }; // date is in the future
    }

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 13) {
      return { tooYoung: true };
    }

    if (age > 100) {
      return { tooOld: true };
    }

    return null;
  }
  get f() {
    return this.signupForm.controls;
  }
  onSubmit(): void {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;
      this.authService.signupUser(formData).subscribe({
        next: (res) => {
          console.log('Signup Successful : ', res);
        },
        error: (err) => {
          console.error('Signup failed ', err);
        },
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
