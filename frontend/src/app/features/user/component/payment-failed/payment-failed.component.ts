import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'zenfit-payment-failed',
  imports: [],
  templateUrl: './payment-failed.component.html',
  styleUrl: './payment-failed.component.css',
})
export class PaymentFailedComponent {
  private readonly _router = inject(Router);

  returnToHomepage(): void {
    this._router.navigate(['/user/dashboard']);
  }
}
