import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  authService = inject(AuthService);
  router = inject(Router);
  logger: any;
  logOutUser() {
    this.authService.logout().subscribe({
      next: (res) => {
        this.logger.info(res.message);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.logger.error(err);
      },
    });
  }
}
