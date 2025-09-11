import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClassModule } from 'primeng/styleclass';
import { CommonModule } from '@angular/common';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number | string;
  isActive?: boolean;
  children?: MenuItem[];
}

export interface SidebarSection {
  title: string;
  items: MenuItem[];
}

export interface SidebarConfig {
  companyName: string;
  companyLogo?: string;
  sections: SidebarSection[];
  settingsItem?: MenuItem;
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    SidebarModule,
    ButtonModule,
    RippleModule,
    AvatarModule,
    StyleClassModule,
    CommonModule,
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
})
export class SideBarComponent {
  // @Input() visible: boolean = false;

  @Input() config: SidebarConfig = {
    companyName: 'Company',
    sections: [],
  };

  @Input() isOpen: boolean = false;
  @Input() activeItemId: string = '';

  @Output() itemClick = new EventEmitter<MenuItem>();
  @Output() sidebarToggle = new EventEmitter<boolean>();
  @Output() settingsClick = new EventEmitter<void>();

  isMobile: boolean = false;

  defaultConfig: SidebarConfig = {
    companyName: 'Company',
    companyLogo: 'F',
    sections: [
      {
        title: 'Company',
        items: [
          { id: 'general', label: 'General', icon: 'settings' },
          { id: 'users', label: 'Users', icon: 'users', badge: 16 },
          { id: 'teams', label: 'Teams', icon: 'user-group', badge: 10 },
          { id: 'custom-fields', label: 'Custom fields', icon: 'document' },
          {
            id: 'billing',
            label: 'Billing',
            icon: 'credit-card',
            isActive: true,
          },
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

  ngOnInit(): void {
    if (!this.config.sections?.length) {
      this.config = this.defaultConfig;
    }
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
    if (!this.isMobile && this.isOpen) {
      this.closeSidebar();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(): void {
    if (this.isMobile && this.isOpen) {
      this.closeSidebar();
    }
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 1024;
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
    this.sidebarToggle.emit(this.isOpen);
  }

  openSidebar(): void {
    this.isOpen = true;
    this.sidebarToggle.emit(this.isOpen);
  }

  closeSidebar(): void {
    this.isOpen = false;
    this.sidebarToggle.emit(this.isOpen);
  }

  onItemClick(item: MenuItem): void {
    this.activeItemId = item.id;
    this.itemClick.emit(item);

    // Auto-close on mobile after selection
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  onSettingsClick(): void {
    this.settingsClick.emit();

    // Auto-close on mobile after selection
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  isItemActive(item: MenuItem): boolean {
    return this.activeItemId === item.id || item.isActive === true;
  }

  getIconSvg(iconName: string): string {
    const icons: { [key: string]: string } = {
      settings:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      users:
        'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      'user-group':
        'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      document:
        'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'credit-card':
        'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      shield:
        'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      puzzle:
        'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1z',
      user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      code: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      warning:
        'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      menu: 'M4 6h16M4 12h16M4 18h16',
      close: 'M6 18L18 6M6 6l12 12',
    };

    return icons[iconName] || icons['settings'];
  }
}
