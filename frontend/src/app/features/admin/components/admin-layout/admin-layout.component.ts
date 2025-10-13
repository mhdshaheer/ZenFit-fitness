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
  private router = inject(Router);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);

  private destroy$ = new Subject<void>(); // used to unsubscribe

  userMenu: Menu[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'fas fa-user' },
    { label: 'Users', route: '/admin/users', icon: 'fas fa-dumbbell' },

    { label: 'Programs', route: '/admin/programs', icon: 'fas fa-cog' },
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
    this.authService
      .logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.logger.info(res.message);
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.logger.error(err);
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); // trigger unsubscribe
    this.destroy$.complete(); // complete the subject
  }
}
