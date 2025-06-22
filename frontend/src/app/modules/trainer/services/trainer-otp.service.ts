import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TrainerOtpService {
  private allowed = false;
  allowAccess() {
    this.allowed = true;
  }
  canAccess() {
    return this.allowed;
  }
  clearAccess() {
    this.allowed = false;
  }
}
