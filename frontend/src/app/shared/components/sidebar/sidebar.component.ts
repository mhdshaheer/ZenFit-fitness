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

  toggleMobile(): void {
    this.isMobileOpen = !this.isMobileOpen;
    this.mobileToggle.emit(this.isMobileOpen);
    if (this.isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  onMenuItemClick(item: MenuItem): void {
    this.menuItemClicked.emit(item);

    if (this.isMobileOpen) {
      this.isMobileOpen = false;
      this.mobileToggle.emit(false);
      document.body.style.overflow = '';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isLargeScreen = window.innerWidth < 1024;
    this.handleScreenSize();
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isMobileOpen) {
      this.toggleMobile();
    }
  }

  private handleScreenSize(): void {
    const isLargeScreen = window.innerWidth >= 1024;

    if (isLargeScreen && this.isMobileOpen) {
      this.isMobileOpen = false;
      this.mobileToggle.emit(false);
      document.body.style.overflow = '';
    }
  }

  private loadSidebarState(): void {
    try {
      const saved = localStorage.getItem('sidebarOpen');
      if (saved !== null) {
        this.isDesktopOpen = JSON.parse(saved);
      } else {
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
