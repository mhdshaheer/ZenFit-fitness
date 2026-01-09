import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentHistory } from '../../../interface/payment.interface';

@Component({
  selector: 'app-wallet',
  imports: [CommonModule],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent {
  @Input() walletBalance = 0;
  @Input() paymentHistory: PaymentHistory[] = [];

  @Output() withdraw = new EventEmitter<void>();

  handleWithdraw() {
    this.withdraw.emit();
  }
}
