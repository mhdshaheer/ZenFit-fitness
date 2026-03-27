import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../../core/services/payment.service';

@Component({
  selector: 'zenfit-payment-success',
  imports: [],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css',
})
export class PaymentSuccessComponent implements OnInit {
  private readonly _router = inject(Router);
  private readonly _route = inject(ActivatedRoute);
  private readonly _paymentService = inject(PaymentService);

  ngOnInit(): void {
    const sessionId = this._route.snapshot.queryParamMap.get('session_id');
    if (sessionId) {
      console.log('Verifying payment for session:', sessionId);
      this._paymentService.verifyPayment(sessionId).subscribe({
        next: (res) => {
          console.log('Payment verification result:', res);
        },
        error: (err) => {
          console.error('Payment verification failed:', err);
        }
      });
    }
  }

  returnToHomepage(): void {
    this._router.navigate(['/user/my-programs']);
  }
}
