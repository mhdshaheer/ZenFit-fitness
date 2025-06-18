import { Routes } from '@angular/router';
import { LoginUserComponent } from './pages/login-user/login-user.component';
import { SignupUserComponent } from './pages/signup-user/signup-user.component';
import { HomeUserComponent } from './pages/home-user/home-user.component';

export const USER_ROUTES: Routes = [
  { path: 'login', component: LoginUserComponent },
  { path: 'signup', component: SignupUserComponent },
  { path: 'home', component: HomeUserComponent },
];
