import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthError, selectAuthLoading } from '../../store/auth.selectors';
import { login } from '../../store/auth.actions';
import { SharedFormComponent } from '../../../../shared/components/shared-form/shared-form.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoggerService } from '../../../../core/services/logger.service';
import { environment } from '../../../../../environments/environment';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';
import { FORM_CONSTANTS } from '../../../../shared/constants/form.constants';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, SharedFormComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _store = inject(Store);
  private readonly _logger = inject(LoggerService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _toastService = inject(ToastService);

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

  ngOnInit(): void {
    const errorParam = this._route.snapshot.queryParamMap.get('error');
    if (errorParam) {
      this._toastService.error(errorParam);
      // Clean query params from URL
      this._router.navigate([], {
        relativeTo: this._route,
        queryParams: { error: null },
        queryParamsHandling: 'merge',
      });
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this._store.dispatch(login({ payload: { email, password } }));
    this._logger.info('Login submitted: ', this.loginForm.value);
  }
  loginWithGoogle() {
    this._logger.info('clicked google login..');
    window.location.href = `${environment.apiUrl}/auth/google`;
    this._logger.info('after google login : page - signup-user');
  }
}
