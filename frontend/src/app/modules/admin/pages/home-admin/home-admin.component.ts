import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-admin',
  imports: [CommonModule],
  templateUrl: './home-admin.component.html',
  styleUrl: './home-admin.component.css',
})
export class HomeAdminComponent {
  userStats = {
    total: 2,
    active: 3,
  };

  trainerStats = {
    total: 2,
    available: 2,
  };

  constructor(private router: Router) {}

  navigateToUsers(action: string) {
    switch (action) {
      case 'view':
        console.log('Navigating to view users');
        // this.router.navigate(['/admin/users']);
        break;
      case 'add':
        console.log('Navigating to add user');
        // this.router.navigate(['/admin/users/add']);
        break;
      case 'roles':
        console.log('Navigating to manage roles');
        // this.router.navigate(['/admin/roles']);
        break;
    }
  }

  navigateToTrainers(action: string) {
    switch (action) {
      case 'view':
        console.log('Navigating to view trainers');
        // this.router.navigate(['/admin/trainers']);
        break;
      case 'add':
        console.log('Navigating to add trainer');
        // this.router.navigate(['/admin/trainers/add']);
        break;
      case 'schedule':
        console.log('Navigating to manage schedules');
        // this.router.navigate(['/admin/trainers/schedule']);
        break;
    }
  }
  goToUserList() {
    this.router.navigate(['/admin/list']);
  }

  logout() {
    // Clear any stored authentication tokens
    localStorage.removeItem('authToken');
    sessionStorage.clear();

    console.log('User logged out');

    // Navigate to login page
    this.router.navigate(['/login']);

    // You might also want to call an authentication service here
    // this.authService.logout();
  }
}
