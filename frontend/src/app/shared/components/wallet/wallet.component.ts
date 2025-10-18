import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentHistory } from '../../../interface/payment.interface';

@Component({
  selector: 'zenfit-wallet',
  imports: [CommonModule],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent {
  @Input() walletBalance = 0;
  @Input() paymentHistory: PaymentHistory[] = [];

  @Output() onWithdraw = new EventEmitter<void>();

  handleWithdraw() {
    this.onWithdraw.emit();
  }
}
