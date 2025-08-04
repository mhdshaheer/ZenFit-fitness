import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  MenuItem,
  SideBarComponent,
  SidebarConfig,
} from '../../../../shared/components/side-bar/side-bar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-home-admin',
  standalone: true,
  imports: [CommonModule, SideBarComponent, RouterModule],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css',
})
export class HomeAdminComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);
  private route = inject(ActivatedRoute);

  // ==================================
  isSidebarOpen = false;
  activeMenuItem = 'general';

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
  // onMenuItemClick(item: MenuItem): void {
  //   console.log('Menu item clicked:', item);
  //   this.activeMenuItem = item.id;

  //   // Or handle specific actions
  //   switch (item.id) {
  //     case 'billing':
  //       this.handleBilling();
  //       break;
  //     case 'members':
  //       this.handleMembers();
  //       break;
  //     // Add more cases as needed
  //     default:
  //       this.handleDefaultNavigation(item);
  //   }
  // }
  onMenuItemClick(item: MenuItem): void {
    console.log('Navigating to:', item.id);
    console.log('Item is :', item);
    console.log('Route is :', this.route);
    this.router.navigate([item.id], { relativeTo: this.route }); // Relative navigation
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
  }

  // Toggle sidebar programmatically
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Get page title based on active menu item
  getPageTitle(): string {
    // const titles: { [key: string]: string } = {
    //   general: 'General Settings',
    //   members: 'Team Members',
    //   teams: 'Teams Management',
    //   'custom-fields': 'Custom Fields',
    //   billing: 'Billing & Subscription',
    //   security: 'Security Settings',
    //   integrations: 'Integrations',
    //   profile: 'User Profile',
    //   password: 'Password Settings',
    //   apis: 'API Management',
    //   'danger-zone': 'Danger Zone',
    //   settings: 'Settings',
    // };
    const titles: Record<string, string> = {
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
