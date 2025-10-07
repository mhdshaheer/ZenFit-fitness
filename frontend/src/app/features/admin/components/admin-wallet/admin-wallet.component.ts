import { Component, inject } from '@angular/core';
import { PaymentService } from '../../../../core/services/payment.service';
import { PaymentHistory } from '../../../../interface/payment.interface';
import { WalletComponent } from '../../../../shared/components/wallet/wallet.component';

@Component({
  selector: 'zenfit-admin-wallet',
  imports: [WalletComponent],
  templateUrl: './admin-wallet.component.html',
  styleUrl: './admin-wallet.component.css',
})
export class AdminWalletComponent {
  totalAmont = 0;
  paymentService = inject(PaymentService);
  paymentHistoryData: PaymentHistory[] = [];

  getHistoryPayments() {
    this.paymentService.getHistoryAdmin().subscribe((res: PaymentHistory[]) => {
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
