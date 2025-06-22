import { Routes } from '@angular/router';
import { SignupTrainerComponent } from './pages/signup-trainer/signup-trainer.component';
import { SignupTrainerOtpComponent } from './pages/signup-trainer-otp/signup-trainer-otp.component';
import { LoginTrainerComponent } from './pages/login-trainer/login-trainer.component';
import { TrainerOtpGuard } from '../../shared/guards/trainer-otp.guard';

export const TRAINER_ROUTES: Routes = [
  { path: 'signup', component: SignupTrainerComponent },
  { path: 'login', component: LoginTrainerComponent },
  {
    path: 'otp',
    component: SignupTrainerOtpComponent,
    canActivate: [TrainerOtpGuard],
  },
];
