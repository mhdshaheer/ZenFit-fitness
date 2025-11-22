import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OtpAccessService {
  private _allowed = false;

  allowAccess(): void {
    this._allowed = true;
    sessionStorage.setItem('canAccessOtp', 'true');
  }

  canAccess(): boolean {
    return this._allowed || sessionStorage.getItem('canAccessOtp') === 'true';
  }

  clearAccess(): void {
    this._allowed = false;
    sessionStorage.removeItem('canAccessOtp');
  }
}
