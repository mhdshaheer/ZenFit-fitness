import { Component, inject, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LoggerService } from '../../../../core/services/logger.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { Subject, takeUntil } from 'rxjs';

interface Menu {
  label: string;
  route: string;
  icon: string;
}
@Component({
  selector: 'app-admin-layout',
  imports: [RouterModule, SidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent implements OnDestroy {
  private readonly _router = inject(Router);
  private readonly _authService = inject(AuthService);
  private readonly _logger = inject(LoggerService);

  private readonly _destroy$ = new Subject<void>();

  userMenu: Menu[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'fas fa-user' },
    { label: 'Users', route: '/admin/users', icon: 'fas fa-dumbbell' },

    { label: 'Programs', route: '/admin/programs', icon: 'fas fa-cog' },
    {
      label: 'Purchased Programs',
      route: '/admin/purchased-programs',
      icon: 'fas fa-cog',
    },
    { label: 'Category', route: '/admin/category', icon: 'fas fa-cog' },
    { label: 'Wallet', route: '/admin/wallet', icon: 'fas fa-wallet' },
  ];
  handleMenuClick(item: Menu) {
    console.log('Clicked menu item:', item);
  }

  handleMobileToggle(isOpen: boolean) {
    console.log('Sidebar mobile state:', isOpen);
  }

  logOutUser() {
    this._authService
      .logout()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._logger.info(res.message);
          this._router.navigate(['/auth/login']);
        },
        error: (err) => {
          this._logger.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
