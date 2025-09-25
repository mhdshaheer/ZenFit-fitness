import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

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
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  // Configuration inputs
  @Input() logoText: string = 'ZenFit';
  @Input() searchPlaceholder: string = 'Search workouts, exercises...';
  @Input() showDateBanner: boolean = true;

  // Data inputs
  @Input() userProfile: UserProfile | null = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Fitness Enthusiast',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  };

  @Input() navigationItems: NavMenuItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'fas fa-tachometer-alt' },
    { label: 'Workouts', route: '/workouts', icon: 'fas fa-dumbbell' },
    { label: 'Progress', route: '/progress', icon: 'fas fa-chart-line' },
    { label: 'Nutrition', route: '/nutrition', icon: 'fas fa-apple-alt' },
  ];

  @Input() userMenuItems: NavMenuItem[] = [
    { label: 'My Profile', route: '/profile', icon: 'fas fa-user' },
    { label: 'Settings', route: '/settings', icon: 'fas fa-cog' },
    { label: 'Help & Support', route: '/help', icon: 'fas fa-question-circle' },
    { label: 'Privacy', route: '/privacy', icon: 'fas fa-shield-alt' },
  ];

  // Event outputs
  @Output() searchChange = new EventEmitter<string>();
  @Output() searchSubmit = new EventEmitter<string>();
  @Output() userMenuClick = new EventEmitter<NavMenuItem>();
  @Output() logout = new EventEmitter<void>();
  @Output() mobileMenuToggle = new EventEmitter<boolean>();

  // Component state
  searchQuery: string = '';
  isUserMenuOpen: boolean = false;
  isMobileMenuOpen: boolean = false;

  onSearchChange() {
    this.searchChange.emit(this.searchQuery);
  }

  onSearchSubmit() {
    this.searchSubmit.emit(this.searchQuery);
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchChange.emit('');
  }

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
