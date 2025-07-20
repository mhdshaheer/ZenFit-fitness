import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OtpAccessService {
  private allowed = false;

  allowAccess(): void {
    this.allowed = true;
    sessionStorage.setItem('canAccessOtp', 'true');
  }

  canAccess(): boolean {
    return this.allowed || sessionStorage.getItem('canAccessOtp') === 'true';
  }

  clearAccess(): void {
    this.allowed = false;
    sessionStorage.removeItem('canAccessOtp');
  }
}
