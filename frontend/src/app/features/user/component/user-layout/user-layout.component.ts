import { Component, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from '../../../../shared/components/sidebar/sidebar.component';
import {
  HeaderComponent,
  NavMenuItem,
  UserProfile,
} from '../../../../shared/components/header/header.component';
import { ProfileService } from '../../../../core/services/profile.service';

interface Menu {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-user-layout',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.css',
})
export class UserLayoutComponent {
  isMobileMenuOpen = false;
  authService = inject(AuthService);
  logger = inject(LoggerService);
  router = inject(Router);
  profileService = inject(ProfileService);

  // Sidebar
  userMenu: Menu[] = [
    { label: 'Profile', route: '/user/profile', icon: 'fas fa-user' },
    { label: 'Workouts', route: '/user/workouts', icon: 'fas fa-dumbbell' },
    { label: 'Settings', route: '/user/settings', icon: 'fas fa-cog' },
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onMobileToggle(isOpen: boolean) {
    this.isMobileMenuOpen = isOpen;
  }

  onMenuItemClicked(item: MenuItem) {
    console.log('Menu item clicked:', item);
  }

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
  ngOnInit() {
    this.getUserProfile();
  }

  // =================================================
  currentUser: UserProfile = {
    name: '',
    email: '',
    role: '',
    avatar: '',
  };
  getUserProfile() {
    let userData = {
      name: '',
      email: '',
      role: '',
      avatar: '',
    };
    this.profileService.getProfile().subscribe((res) => {
      if (res.profileImage) {
        this.profileService.getFile(res.profileImage).subscribe((fileRes) => {
          userData.avatar = fileRes.url;
        });
      }
      userData.name = res.fullName;
      userData.email = res.email;
      userData.role = res.role;
      this.currentUser = userData;
    });
  }

  navItems: NavMenuItem[] = [
    {
      label: 'Dashboard',
      route: '/user/dashboard',
      icon: 'fas fa-tachometer-alt',
    },
    { label: 'Workouts', route: '/user/workouts', icon: 'fas fa-dumbbell' },
    { label: 'Progress', route: '/user/progress', icon: 'fas fa-chart-line' },
    { label: 'Nutrition', route: '/user/nutrition', icon: 'fas fa-apple-alt' },
    { label: 'Community', route: '/user/community', icon: 'fas fa-users' },
  ];

  userMenuItems: NavMenuItem[] = [
    { label: 'My Profile', route: '/user/profile', icon: 'fas fa-user' },

    { label: 'Help & Support', route: '/help', icon: 'fas fa-question-circle' },
  ];

  searchResults: any[] = [];
  activityLog: any[] = [];

  handleSearchChange(query: string) {
    console.log('Search query changed:', query);
  }

  handleSearchSubmit(query: string) {
    console.log('Search submitted:', query);
    this.addToActivityLog('fas fa-search', `Search submitted: "${query}"`);
  }

  handleUserMenuClick(item: NavMenuItem) {
    console.log('User menu clicked:', item);
    this.addToActivityLog(
      item.icon || 'fas fa-mouse-pointer',
      `Clicked: ${item.label}`
    );
  }

  handleLogout() {
    this.logOutUser();
    this.addToActivityLog('fas fa-sign-out-alt', 'User logged out');
    // Handle logout logic here
  }

  handleMobileMenuToggle(isOpen: boolean) {
    console.log('Mobile menu toggled:', isOpen);
    this.addToActivityLog(
      'fas fa-bars',
      `Mobile menu ${isOpen ? 'opened' : 'closed'}`
    );
  }

  private addToActivityLog(icon: string, message: string) {
    this.activityLog.unshift({
      icon,
      message,
      timestamp: new Date(),
    });

    // Keep only last 10 activities
    if (this.activityLog.length > 10) {
      this.activityLog = this.activityLog.slice(0, 10);
    }
  }
}
