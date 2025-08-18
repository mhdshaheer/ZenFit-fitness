import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() menuItems: MenuItem[] = [];
  @Input() appName: string = 'ZenFit';

  @Input() userName: string = 'User';
  @Input() userRole: string = 'Member';
  @Input() isMobileOpen: boolean = false;

  @Output() mobileToggle = new EventEmitter<boolean>();
  @Output() menuItemClicked = new EventEmitter<MenuItem>();

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
    this.mobileToggle.emit(this.isMobileOpen);
  }

  onMenuItemClick(item: MenuItem) {
    this.menuItemClicked.emit(item);
    // Close mobile menu when item is clicked
    if (this.isMobileOpen) {
      this.isMobileOpen = false;
      this.mobileToggle.emit(false);
    }
  }
}
