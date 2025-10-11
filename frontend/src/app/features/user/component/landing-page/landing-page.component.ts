
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  activeProgram = 2;
  private intervalId: any;
  private router = inject(Router);

  stats = [
    { number: '28', label: 'Exercise Programs' },
    { number: '980+', label: 'Members' },
    { number: '180+', label: 'Total Coach' },
  ];

  programs = [
    {
      id: 0,
      name: 'Bodybalance',
      category: 'Mind & Body',
      image:
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 1,
      name: 'Zumba',
      category: 'Dance',
      image:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      color: 'from-orange-500 to-red-500',
    },
    {
      id: 2,
      name: 'Bodypump',
      category: 'Strength & Conditioning',
      image:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      color: 'from-green-500 to-teal-500',
    },
    {
      id: 3,
      name: 'Bodystep',
      category: 'Cardio',
      image:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      color: 'from-blue-500 to-purple-500',
    },
    {
      id: 4,
      name: 'HIIT x Power',
      category: 'HIIT',
      image:
        'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=300&fit=crop',
      color: 'from-red-500 to-orange-500',
    },
  ];

  features = [
    'Professional certified trainers',
    'Modern equipment and facilities',
    'Personalized workout plans',
    'Nutrition guidance included',
    '24/7 gym access',
    'Group classes available',
  ];

  testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Member since 2023',
      text: "The trainers here are amazing! I've achieved results I never thought possible.",
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Mike Chen',
      role: 'Member since 2022',
      text: "Best gym I've ever been to. The variety of programs keeps me motivated every day.",
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Member since 2023',
      text: "The community here is incredible. Everyone supports each other's fitness journey.",
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
  ];

  ngOnInit() {
    // Auto-rotate programs every 4 seconds
    this.intervalId = setInterval(() => {
      this.activeProgram = (this.activeProgram + 1) % this.programs.length;
    }, 4000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  setActiveProgram(index: number) {
    this.activeProgram = index;
  }

  toLogin() {
    this.router.navigate(['/auth/login']);
  }
  toSignup() {
    this.router.navigate(['/auth/signup']);
  }
}
