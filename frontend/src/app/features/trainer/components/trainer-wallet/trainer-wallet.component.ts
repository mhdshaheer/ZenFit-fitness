import { Component, inject } from '@angular/core';
import { WalletComponent } from '../../../../shared/components/wallet/wallet.component';
import { PaymentHistory } from '../../../../interface/payment.interface';
import { PaymentService } from '../../../../core/services/payment.service';

@Component({
  selector: 'zenfit-trainer-wallet',
  imports: [WalletComponent],
  templateUrl: './trainer-wallet.component.html',
  styleUrl: './trainer-wallet.component.css',
})
export class TrainerWalletComponent {
  totalAmont = 0;
  paymentService = inject(PaymentService);
  paymentHistoryData: PaymentHistory[] = [
    {
      _id: '1',
      programName: 'Angular Masterclass',
      price: 299.99,
      date: 'Oct 5, 2025',
      status: 'success',
      referenceNumber: 'REF987654321',
    },
  ];

  getHistoryPayments() {
    this.paymentService.getHistory().subscribe((res: PaymentHistory[]) => {
      this.paymentHistoryData = res;
      this.totalAmont = res.reduce((acc, curr) => acc + curr.price, 0);
    });
  }

  ngOnInit() {
    this.getHistoryPayments();
  }

  withdrawMoney() {
    console.log('Withdraw clicked!');
  }
}
