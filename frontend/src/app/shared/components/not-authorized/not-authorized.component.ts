import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'zenfit-not-authorized',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div class="max-w-md w-full text-center space-y-8 animate-fadeIn">
        <div class="relative">
          <div class="absolute inset-0 bg-secondary-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
          <div class="relative w-24 h-24 mx-auto bg-white rounded-3xl shadow-xl flex items-center justify-center text-secondary-500 transform -rotate-6">
            <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div class="space-y-4">
          <h1 class="text-4xl font-black text-neutral-900 tracking-tight">Access Denied</h1>
          <p class="text-neutral-500 body-base">
            You don't have the required permissions to access this area. If you believe this is an error, please contact support.
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <button (click)="goHome()" class="btn btn-primary btn-lg w-full">
            Back to Dashboard
          </button>
          <button (click)="logout()" class="btn btn-ghost w-full">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
  `]
})
export class NotAuthorizedComponent {
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);

  goHome() {
    const role = localStorage.getItem('userRole');
    if (role === 'admin') this._router.navigate(['/admin']);
    else if (role === 'trainer') this._router.navigate(['/trainer']);
    else this._router.navigate(['/user']);
  }

  logout() {
    this._authService.logout().subscribe(() => {
      this._router.navigate(['/auth/login']);
    });
  }
}
