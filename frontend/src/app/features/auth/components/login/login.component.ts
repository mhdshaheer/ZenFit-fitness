import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  selectError,
  selectLoading,
  selectRole,
  selectToken,
} from '../../../store/auth/auth.selectors';
import { Observable } from 'rxjs';
import { login } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm!: FormGroup;
  submitted: boolean = false;
  showPassword: boolean = false;
  error$!: Observable<string | null>;
  loading$!: Observable<boolean>;
  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router
  ) {
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
      role: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    this.error$ = this.store.select(selectError);
    this.loading$ = this.store.select(selectLoading);

    // Handle redirection based on token role
    this.store.select(selectToken).subscribe((token) => {
      if (token) {
        this.store.select(selectRole).subscribe((role) => {
          if (role == 'admin') {
            this.router.navigate(['/admin/home']);
          } else if (role == 'user') {
            this.router.navigate(['/user/home']);
          } else if (role == 'trainer') {
            this.router.navigate(['/trainer/home']);
          }
        });
      }
    });
  }
  get f() {
    return this.loginForm.controls;
  }
  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    const { email, password, role } = this.loginForm.value;
    this.store.dispatch(login({ email, password, role }));
    console.log('Form submitted : ', this.loginForm.value);
  }
}
