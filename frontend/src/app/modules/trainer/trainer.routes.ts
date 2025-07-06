import { Routes } from '@angular/router';
import { SignupTrainerComponent } from './pages/signup-trainer/signup-trainer.component';
import { SignupTrainerOtpComponent } from './pages/signup-trainer-otp/signup-trainer-otp.component';
import { TrainerOtpGuard } from '../../shared/guards/trainer-otp.guard';
import { HomeTrainerComponent } from './pages/home-trainer/home-trainer.component';

export const TRAINER_ROUTES: Routes = [
  { path: 'signup', component: SignupTrainerComponent },
  {
    path: 'otp',
    component: SignupTrainerOtpComponent,
    // canActivate: [TrainerOtpGuard],
  },
  { path: 'home', component: HomeTrainerComponent },
];
