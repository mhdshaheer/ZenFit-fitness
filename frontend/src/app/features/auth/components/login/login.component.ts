import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    SharedFormComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  loginForm!: FormGroup;
  submitted = signal(false);
  showPassword = signal(false);
  error = toSignal(this.store.select(selectAuthError), { initialValue: null });
  isLoading = toSignal(this.store.select(selectAuthLoading), {
    initialValue: false,
  });

  constructor() {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
          ),
        ],
      ],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted.set(true);
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.store.dispatch(login({ payload: { email, password } }));
    console.log('Login submitted: ', this.loginForm.value);
  }
}
