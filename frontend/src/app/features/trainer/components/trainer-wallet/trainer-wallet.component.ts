import { Component } from '@angular/core';
import { WalletComponent } from '../../../../shared/components/wallet/wallet.component';
import { PaymentHistory } from '../../../../interface/payment.interface';

@Component({
  selector: 'zenfit-trainer-wallet',
  imports: [WalletComponent],
  templateUrl: './trainer-wallet.component.html',
  styleUrl: './trainer-wallet.component.css',
})
export class TrainerWalletComponent {
  paymentHistoryData: PaymentHistory[] = [
    {
      _id: '1',
      courseName: 'Angular Masterclass',
      price: 299.99,
      date: 'Oct 5, 2025',
      status: 'success',
      referenceNumber: 'REF987654321',
    },
  ];

  withdrawMoney() {
    console.log('Withdraw clicked!');
  }
}
