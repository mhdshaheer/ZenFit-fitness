import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, ReactiveFormsModule],
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

      // Simulate API call
      const email = this.forgotPasswordForm.get('email')?.value;

      // Replace this with your actual password reset service
      this.resetPassword(email)
        .then(() => {
          this.isLoading = false;
          // Success state is handled by template
        })
        .catch((error) => {
          this.isLoading = false;
          console.error('Password reset failed:', error);
          // Handle error state here
        });
    }
  }

  onBackToLogin(): void {
    // Emit event or navigate to login page
    console.log('Navigate to login page');
    // Example: this.router.navigate(['/login']);
  }

  onContactSupport(): void {
    // Handle contact support action
    console.log('Contact support clicked');
    // Example: window.open('mailto:support@yourcompany.com');
  }

  private async resetPassword(email: string): Promise<void> {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Password reset requested for: ${email}`);
        resolve();
      }, 2000);
    });
  }
}
