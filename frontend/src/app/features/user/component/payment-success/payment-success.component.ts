import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'zenfit-payment-success',
  imports: [],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css',
})
export class PaymentSuccessComponent {
  private readonly _router = inject(Router);

  returnToHomepage(): void {
    this._router.navigate(['/user/dashboard']);
  }
}
