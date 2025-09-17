import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  HostListener,
} from '@angular/core';
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
export class SidebarComponent implements OnInit {
  @Input() menuItems: MenuItem[] = [];
  @Input() appName: string = 'ZenFit';
  @Input() userName: string = 'User';
  @Input() userRole: string = 'Member';
  @Input() isMobileOpen: boolean = false;

  @Output() mobileToggle = new EventEmitter<boolean>();
  @Output() desktopToggle = new EventEmitter<boolean>();
  @Output() menuItemClicked = new EventEmitter<MenuItem>();
  @Output() logOutClicked = new EventEmitter<void>();

  isDesktopOpen: boolean = true;
  isLargeScreen = window.innerWidth >= 1024;

  ngOnInit(): void {
    this.loadSidebarState();
    this.handleScreenSize();
  }

  /**
   * Toggle mobile sidebar
   */
  toggleMobile(): void {
    this.isMobileOpen = !this.isMobileOpen;
    this.mobileToggle.emit(this.isMobileOpen);

    // Prevent body scroll when mobile menu is open
    if (this.isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle menu item click
   */
  onMenuItemClick(item: MenuItem): void {
    this.menuItemClicked.emit(item);

    // Close mobile menu when item is clicked
    if (this.isMobileOpen) {
      this.isMobileOpen = false;
      this.mobileToggle.emit(false);
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle screen resize
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth < 1024;
    this.handleScreenSize();
  }

  /**
   * Handle escape key to close mobile sidebar
   */
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isMobileOpen) {
      this.toggleMobile();
    }
  }

  /**
   * Handle screen size changes
   */
  private handleScreenSize(): void {
    const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint

    if (isLargeScreen && this.isMobileOpen) {
      // Close mobile sidebar on large screens
      this.isMobileOpen = false;
      this.mobileToggle.emit(false);
      document.body.style.overflow = '';
    }
  }

  /**
   * Load sidebar state from localStorage
   */
  private loadSidebarState(): void {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        this.isDesktopOpen = JSON.parse(saved);
      } else {
        // Default to open on desktop, closed on smaller screens
        this.isDesktopOpen = window.innerWidth >= 1024;
      }
    } catch (error) {
      console.warn('Failed to load sidebar state:', error);
      this.isDesktopOpen = true;
    }
  }

  onLogout() {
    this.logOutClicked.emit();
  }
}
