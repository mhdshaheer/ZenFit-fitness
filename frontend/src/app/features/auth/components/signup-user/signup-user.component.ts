import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SharedFormComponent } from '../../../../shared/components/shared-form/shared-form.component';
import { Store } from '@ngrx/store';
import { selectAuthLoading } from '../../../../features/auth/store/auth.selectors';
import * as AuthActions from '../../../../features/auth/store/auth.actions';

@Component({
  selector: 'app-signup-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedFormComponent],
  templateUrl: './signup-user.component.html',
  styleUrl: './signup-user.component.css',
})
export class SignupUserComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  isLoading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });

  constructor() {
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
        role: ['', [Validators.required]],
      },
      {
        validators: [this.passwordMatchValidator],
      }
    );
  }

  passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  selectRole(role: 'user' | 'trainer') {
    this.signupForm.patchValue({ role: role });
    this.signupForm.get('role')?.markAsTouched();
  }

  get f() {
    return this.signupForm.controls;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;
      console.log('Data is submitted...', formData);
      this.store.dispatch(
        AuthActions.signup({
          payload: {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          },
        })
      );
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
