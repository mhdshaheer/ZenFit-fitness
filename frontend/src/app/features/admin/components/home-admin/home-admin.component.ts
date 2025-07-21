import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  MenuItem,
  SideBarComponent,
  SidebarConfig,
} from '../../../../shared/components/side-bar/side-bar.component';
import { UserManageComponent } from '../user-manage/user-manage.component';
import { AuthService } from '../../../../core/services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, SideBarComponent, UserManageComponent],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css',
})
export class HomeAdminComponent {
  showSidebar: boolean = false;
  private router = inject(Router);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);

  // ==================================
  isSidebarOpen: boolean = false;
  activeMenuItem: string = 'general';

  // Customizable sidebar configuration
  sidebarConfig: SidebarConfig = {
    companyName: 'MyCompany',
    companyLogo: 'MC', // or use single letter
    sections: [
      {
        title: 'Company',
        items: [
          { id: 'general', label: 'General', icon: 'settings' },
          { id: 'members', label: 'Members', icon: 'users', badge: 16 },
          { id: 'teams', label: 'Teams', icon: 'user-group', badge: 10 },
          { id: 'custom-fields', label: 'Custom fields', icon: 'document' },
          { id: 'billing', label: 'Billing', icon: 'credit-card' },
          { id: 'security', label: 'Security', icon: 'shield' },
          { id: 'integrations', label: 'Integrations', icon: 'puzzle' },
        ],
      },
      {
        title: 'Account',
        items: [
          { id: 'profile', label: 'Profile', icon: 'user' },
          { id: 'password', label: 'Password', icon: 'lock' },
        ],
      },
      {
        title: 'Advanced',
        items: [
          { id: 'apis', label: 'APIs', icon: 'code' },
          { id: 'danger-zone', label: 'Danger zone', icon: 'warning' },
        ],
      },
    ],
    settingsItem: { id: 'settings', label: 'Settings', icon: 'settings' },
  };

  // Handle menu item clicks
  onMenuItemClick(item: MenuItem): void {
    console.log('Menu item clicked:', item);
    this.activeMenuItem = item.id;

    // Add your routing logic here
    // this.router.navigate([`/${item.id}`]);

    // Or handle specific actions
    switch (item.id) {
      case 'billing':
        this.handleBilling();
        break;
      case 'members':
        this.handleMembers();
        break;
      // Add more cases as needed
      default:
        this.handleDefaultNavigation(item);
    }
  }

  // Handle sidebar toggle
  onSidebarToggle(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
    console.log('Sidebar toggled:', isOpen);
  }

  // Handle settings click
  onSettingsClick(): void {
    console.log('Settings clicked');
    this.activeMenuItem = 'settings';
    // Navigate to settings or open settings modal
    // this.router.navigate(['/settings']);
  }

  // Toggle sidebar programmatically
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Get page title based on active menu item
  getPageTitle(): string {
    const titles: { [key: string]: string } = {
      general: 'General Settings',
      members: 'Team Members',
      teams: 'Teams Management',
      'custom-fields': 'Custom Fields',
      billing: 'Billing & Subscription',
      security: 'Security Settings',
      integrations: 'Integrations',
      profile: 'User Profile',
      password: 'Password Settings',
      apis: 'API Management',
      'danger-zone': 'Danger Zone',
      settings: 'Settings',
    };

    return titles[this.activeMenuItem] || 'Dashboard';
  }

  // Example method for handling specific menu actions
  private handleBilling(): void {
    console.log('Handling billing navigation');
    // Implement billing-specific logic
  }

  private handleMembers(): void {
    console.log('Handling members navigation');
    // Implement members-specific logic
  }

  private handleDefaultNavigation(item: MenuItem): void {
    console.log('Default navigation for:', item.label);
    // Implement default navigation logic
  }

  // Example method for changing theme
  changeTheme(): void {
    console.log('Theme change requested');
    // Implement theme switching logic
    // You could emit an event or use a service to change the theme
  }

  // Method to update menu badges dynamically
  updateMemberCount(newCount: number): void {
    const membersItem = this.sidebarConfig.sections
      .find((section) => section.title === 'Company')
      ?.items.find((item) => item.id === 'members');

    if (membersItem) {
      membersItem.badge = newCount;
    }
  }

  // Method to add new menu items dynamically
  addCustomMenuItem(sectionTitle: string, newItem: MenuItem): void {
    const section = this.sidebarConfig.sections.find(
      (s) => s.title === sectionTitle
    );

    if (section) {
      section.items.push(newItem);
    }
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
}
