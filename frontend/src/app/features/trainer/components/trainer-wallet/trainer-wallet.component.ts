import { Component, inject } from '@angular/core';
import { WalletComponent } from '../../../../shared/components/wallet/wallet.component';
import { PaymentHistory } from '../../../../interface/payment.interface';
import { PaymentService } from '../../../../core/services/payment.service';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'zenfit-trainer-wallet',
  imports: [WalletComponent],
  templateUrl: './trainer-wallet.component.html',
  styleUrl: './trainer-wallet.component.css',
})
export class TrainerWalletComponent {
  totalAmont = 0;
  private readonly _paymentService = inject(PaymentService);
  private _logger = inject(LoggerService)
  paymentHistoryData: PaymentHistory[] = [];

  getHistoryPayments() {
    this._paymentService.getHistory().subscribe((res: PaymentHistory[]) => {
      this.paymentHistoryData = res;
      this.totalAmont = res.reduce((acc, curr) => acc + curr.price, 0);
    });
  }

  ngOnInit() {
    this.getHistoryPayments();
  }

  withdrawMoney() {
    this._logger.info('Withdraw clicked!');
  }
}
