import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: '<div class="flex items-center justify-center min-h-screen"><p class="text-xl">Authenticating...</p></div>',
})
export class GoogleCallbackComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);

  ngOnInit(): void {
    const role = this._route.snapshot.queryParamMap.get('role');
    
    if (role) {
      localStorage.setItem('userRole', role);
      
      if (role === 'user') {
        this._router.navigate(['/user/dashboard']);
      } else if (role === 'admin') {
        this._router.navigate(['/admin/dashboard']);
      } else if (role === 'trainer') {
        this._router.navigate(['/trainer/dashboard']);
      } else {
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
}
