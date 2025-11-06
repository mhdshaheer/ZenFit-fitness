import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from '../notification/notification.component';

export interface NavMenuItem {
  label: string;
  route: string;
  icon?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterModule, FormsModule, NotificationComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  // Configuration inputs
  @Input() logoText = 'ZenFit';
  @Input() searchPlaceholder = 'Search workouts, exercises...';
  @Input() showDateBanner = true;

  // Data inputs
  @Input() userProfile?: UserProfile;

  @Input() navigationItems: NavMenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { label: 'Workouts', route: '/workouts', icon: 'fas fa-dumbbell' },
    { label: 'Progress', route: '/progress', icon: 'fas fa-chart-line' },
    { label: 'Nutrition', route: '/nutrition', icon: 'fas fa-apple-alt' },
  ];

  @Input() userMenuItems: NavMenuItem[] = [
    { label: 'My Profile', route: '/profile', icon: 'fas fa-user' },
    { label: 'Settings', route: '/settings', icon: 'fas fa-cog' },
  ];

  // Event outputs
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();
  @Output() userMenuClick = new EventEmitter<NavMenuItem>();
  @Output() logout = new EventEmitter<void>();
  @Output() mobileMenuToggle = new EventEmitter<boolean>();

  // Component state
  isUserMenuOpen = false;
  isMobileMenuOpen = false;

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.mobileMenuToggle.emit(this.isMobileMenuOpen);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.mobileMenuToggle.emit(false);
  }

  onUserMenuClick(item: NavMenuItem) {
    this.userMenuClick.emit(item);
    this.closeUserMenu();
  }

  onLogout() {
    this.logout.emit();
    this.closeUserMenu();
  }

  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return today.toLocaleDateString('en-US', options);
  }
}
