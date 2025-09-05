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

interface Menu {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-trainer-layout',
  imports: [RouterModule, HeaderComponent],
  templateUrl: './trainer-layout.component.html',
  styleUrl: './trainer-layout.component.css',
})
export class TrainerLayoutComponent {
  isMobileMenuOpen = false;
  authService = inject(AuthService);
  logger = inject(LoggerService);
  router = inject(Router);

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
    // Handle menu item click logic here
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

  // =================================================
  currentUser: UserProfile = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Fitness Enthusiast',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  };

  navItems: NavMenuItem[] = [
    {
      label: 'Dashboard',
      route: '/user/dashboard',
      icon: 'fas fa-tachometer-alt',
    },
    { label: 'Workouts', route: '/workouts', icon: 'fas fa-dumbbell' },
    { label: 'Progress', route: '/progress', icon: 'fas fa-chart-line' },
    { label: 'Nutrition', route: '/nutrition', icon: 'fas fa-apple-alt' },
    { label: 'Community', route: '/community', icon: 'fas fa-users' },
  ];

  userMenuItems: NavMenuItem[] = [
    { label: 'My Profile', route: '/user/profile', icon: 'fas fa-user' },
    // { label: 'Account Settings', route: '', icon: 'fas fa-cog' },
    // {
    //   label: 'Subscription',
    //   route: '/subscription',
    //   icon: 'fas fa-credit-card',
    // },
    { label: 'Help & Support', route: '/help', icon: 'fas fa-question-circle' },
    // { label: 'Privacy Policy', route: '/privacy', icon: 'fas fa-shield-alt' },
  ];

  recentActivity = [
    {
      title: 'Completed Morning Cardio',
      description: '30 minutes of high-intensity interval training',
      time: '2 hours ago',
      icon: 'fas fa-running',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
    },
    {
      title: 'New Personal Record',
      description: 'Bench press: 185 lbs (previous: 180 lbs)',
      time: '1 day ago',
      icon: 'fas fa-trophy',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Nutrition Goal Achieved',
      description: 'Met daily protein intake target: 150g',
      time: '2 days ago',
      icon: 'fas fa-apple-alt',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
  ];

  searchResults: any[] = [];
  activityLog: any[] = [];

  handleSearchChange(query: string) {
    console.log('Search query changed:', query);

    // Simulate search results
    if (query.length > 2) {
      this.searchResults = [
        {
          title: 'Push Up Variations',
          description:
            '10 different push-up exercises to build upper body strength',
          icon: 'fas fa-dumbbell',
        },
        {
          title: 'HIIT Cardio Routine',
          description: '20-minute high-intensity interval training workout',
          icon: 'fas fa-heart',
        },
        {
          title: 'Protein Smoothie Recipe',
          description: 'Post-workout smoothie with 25g protein',
          icon: 'fas fa-glass-whiskey',
        },
      ];
    } else {
      this.searchResults = [];
    }

    this.addToActivityLog('fas fa-search', `Searched for: "${query}"`);
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
