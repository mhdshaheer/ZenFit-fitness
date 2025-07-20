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
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser,
} from '@abacritt/angularx-social-login';
import { OtpAccessService } from '../../../../core/services/otp-access.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { environment } from '../../../../../environments/environment';

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
  private socialAuthService = inject(SocialAuthService);
  private otpAccessService = inject(OtpAccessService);
  private logger = inject(LoggerService);

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

  // onGoogleSignup() {
  // this.socialAuthService
  //   .signIn(GoogleLoginProvider.PROVIDER_ID)
  //   .then((user: SocialUser) => {
  //     this.store.dispatch(
  //       AuthActions.googleSignup({
  //         payload: {
  //           idToken: user.idToken,
  //           email: user.email,
  //           username: user.name,
  //         },
  //       })
  //     );
  //   })
  //   .catch((err) => this.logger.error('Google sign-in error:', err));
  // }
  loginWithGoogle() {
    this.logger.info('clicked google login..');
    window.location.href = `${environment.apiUrl}/auth/google`; // backend URL
    this.logger.info('after google login : page - signup-user');
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.otpAccessService.allowAccess();
      const formData = this.signupForm.value;
      this.logger.info('Data is submitted...', formData);
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
