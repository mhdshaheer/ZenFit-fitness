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
import { OtpAccessService } from '../../../../core/services/otp-access.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { environment } from '../../../../../environments/environment';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';
import { FORM_CONSTANTS } from '../../../../shared/constants/form.constants';

@Component({
  selector: 'app-signup-user',
  standalone: true,
  imports: [ReactiveFormsModule, SharedFormComponent],
  templateUrl: './signup-user.component.html',
  styleUrl: './signup-user.component.css',
})
export class SignupUserComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _store = inject(Store);
  private readonly _otpAccessService = inject(OtpAccessService);
  private readonly _logger = inject(LoggerService);

  signupForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  isLoading = toSignal(this._store.select(selectAuthLoading), {
    initialValue: false,
  });

  constructor() {
    this.signupForm = this._fb.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(FORM_CONSTANTS.USERNAME.MIN_LENGTH),
            Validators.maxLength(FORM_CONSTANTS.USERNAME.MAX_LENGTH),
            Validators.pattern(FORM_CONSTANTS.USERNAME.PATTERN),
          ],
        ],
        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.pattern(FORM_CONSTANTS.EMAIL.PATTERN),
          ],
        ],
        password: ['', [Validators.required, passwordStrengthValidator]],
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

  loginWithGoogle() {
    this._logger.info('clicked google login..');
    window.location.href = `${environment.apiUrl}/auth/google`;
    this._logger.info('after google login : page - signup-user');
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this._otpAccessService.allowAccess();
      const formData = this.signupForm.value;
      this._logger.info('Data is submitted...', formData);
      this._store.dispatch(
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
