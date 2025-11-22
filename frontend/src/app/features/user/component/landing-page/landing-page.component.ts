import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ProgramService } from '../../../../core/services/program.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

interface Program {
  _id?: string;
  programId?: string;
  title: string;
  description: string;
  category: string;
  difficultyLevel: string;
  price: number;
  duration: string;
  status: string;
  approvalStatus?: string;
}

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private readonly _router = inject(Router);
  private readonly _programService = inject(ProgramService);
  private readonly _authService = inject(AuthService);
  private _intervalId: any;

  programs: Program[] = [];
  isLoading = false;
  isLoggedIn = false;
  currentUserName = '';

  features = [
    'Professional certified trainers',
    'Modern equipment and facilities',
    'Personalized workout plans',
    'Nutrition guidance included',
    '24/7 gym access',
    'Group classes available',
  ];

  ngOnInit() {
    this.loadPrograms();
    this.checkAuthStatus();
  }

  ngOnDestroy() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  private async checkAuthStatus() {
    try {
      // First check if there's an access token before making API calls
      const token = this._authService.getAccessToken();
      if (!token) {
        this.isLoggedIn = false;
        return;
      }

      this.isLoggedIn = await this._authService.isLoggedIn();
      if (this.isLoggedIn) {
        this.getCurrentUserName();
      }
    } catch (error) {
      // Silently handle auth errors for landing page
      this.isLoggedIn = false;
      this.currentUserName = '';
    }
  }

  private getCurrentUserName() {
    this._authService.getUserProfile().subscribe({
      next: (userProfile) => {
        this.currentUserName = userProfile.username || userProfile.email || 'User';
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
        // Fallback to token-based extraction if API fails
        const token = this._authService.getAccessToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            this.currentUserName = payload.username || payload.name || payload.email || 'User';
          } catch (tokenError) {
            console.error('Error decoding token:', tokenError);
            this.currentUserName = 'User';
          }
        } else {
          this.currentUserName = 'User';
        }
      }
    });
  }

  private loadPrograms() {
    this.isLoading = true;
    this._programService.getAllPrograms().subscribe({
      next: (programs: any) => {
        // Filter only approved and active programs for public display
        this.programs = programs.filter((program: any) => 
          program.status === 'active' && 
          program.approvalStatus === 'Approved'
        ).slice(0, 6); // Limit to 6 programs for the landing page
        this.isLoading = false;
      },
      error: (error: any) => {
        console.log('Programs not available or user not authenticated');
        this.isLoading = false;
        // For landing page, show empty programs if API fails (user might not be logged in)
        this.programs = [];
      }
    });
  }

  toLogin() {
    this._router.navigate(['/auth/login']);
  }
  
  toSignup() {
    this._router.navigate(['/auth/signup']);
  }

  navigateToWorkouts() {
    if (this.isLoggedIn) {
      this._router.navigate(['/user/workouts']);
    } else {
      // Redirect to login first, then to workouts after login
      this._router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/user/workouts' } 
      });
    }
  }

  navigateToHome() {
    if (this.isLoggedIn) {
      this._router.navigate(['/user/dashboard']);
    } else {
      // Redirect to login first, then to dashboard after login
      this._router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/user/dashboard' } 
      });
    }
  }

  logout() {
    this._authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('accessToken');
        this.isLoggedIn = false;
        this.currentUserName = '';
        this._router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local state
        localStorage.removeItem('accessToken');
        this.isLoggedIn = false;
        this.currentUserName = '';
        this._router.navigate(['/']);
      }
    });
  }
}
