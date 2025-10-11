
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isSubmitted = false;
  isLoading = false;

  constructor(private fb: FormBuilder) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;

      const email = this.forgotPasswordForm.get('email')?.value;

      this.resetPassword(email)
        .then(() => {
          this.isLoading = false;
        })
        .catch((error) => {
          this.isLoading = false;
          console.error('Password reset failed:', error);
        });
    }
  }

  onBackToLogin(): void {
    console.log('Navigate to login page');
  }

  private async resetPassword(email: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Password reset requested for: ${email}`);
        resolve();
      }, 2000);
    });
  }
}
