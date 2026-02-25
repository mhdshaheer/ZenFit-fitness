import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedSkeletonComponent } from '../shared-skeleton/shared-skeleton.component';
import { PaymentHistory } from '../../../interface/payment.interface';

@Component({
  selector: 'app-wallet',
  imports: [CommonModule, SharedSkeletonComponent],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent {
  @Input() walletBalance = 0;
  @Input() paymentHistory: PaymentHistory[] = [];
  @Input() isLoading = false;

  @Output() withdraw = new EventEmitter<void>();

  handleWithdraw() {
    this.withdraw.emit();
  }
}
