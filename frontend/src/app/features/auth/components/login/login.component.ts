import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthError, selectAuthLoading } from '../../store/auth.selectors';
import { login } from '../../store/auth.actions';
import { SharedFormComponent } from '../../../../shared/components/shared-form/shared-form.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoggerService } from '../../../../core/services/logger.service';
import { environment } from '../../../../../environments/environment';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';
import { FORM_CONSTANTS } from '../../../../shared/constants/form.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, SharedFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _store = inject(Store);
  private readonly _logger = inject(LoggerService);
  loginForm!: FormGroup;
  submitted = signal(false);
  showPassword = signal(false);
  error = toSignal(this._store.select(selectAuthError), { initialValue: null });
  isLoading = toSignal(this._store.select(selectAuthLoading), {
    initialValue: false,
  });

  constructor() {
    this.loginForm = this._fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(FORM_CONSTANTS.EMAIL.PATTERN),
        ],
      ],
      password: ['', [Validators.required, passwordStrengthValidator]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this._store.dispatch(login({ payload: { email, password } }));
    console.log('Login submitted: ', this.loginForm.value);
  }
  loginWithGoogle() {
    this._logger.info('clicked google login..');
    window.location.href = `${environment.apiUrl}/auth/google`;
    this._logger.info('after google login : page - signup-user');
  }
}
