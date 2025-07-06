import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
})
export class OtpComponent {
  @Input() bgColor = ' from-green-950 via-emerald-950 to-teal-700';
  @Input() buttonColor = 'text-green-600 font-semibold';
  @Input() textColor =
    'text-green-600 font-semibold underline hover:text-green-700';
  @Input() email: string = 'gmail';
  @Input() context: 'signup' | 'login' | 'reset' = 'signup';
  @Output() onVerify = new EventEmitter<string>();
  @Output() onResend = new EventEmitter<void>();

  otpDigits = new Array(6).fill('');
  timer: number = 30;
  intervel: any;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  onInput(event: any, index: number) {
    const input = event.target;
    const value = input.value;

    // Allow only digits
    if (!/^\d$/.test(value)) {
      input.value = '';
      return;
    }

    // Move to next input
    if (value && index < this.otpDigits.length - 1) {
      const nextInput = this.otpInputs.toArray()[index + 1];
      nextInput.nativeElement.focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prevInput = this.otpInputs.toArray()[index - 1];
      prevInput.nativeElement.focus();
    }
  }

  getOtp(): string {
    return this.otpInputs
      .toArray()
      .map((input) => input.nativeElement.value)
      .join('');
  }

  startTimer() {
    this.timer = 2;
    this.intervel = setInterval(() => {
      this.timer--;
      if (this.timer == 0) {
        clearInterval(this.intervel);
      }
    }, 1000);
  }
  ngOnInit() {
    this.startTimer();
  }
  resendOtp() {
    this.onResend.emit();
    this.startTimer();
  }
  onSubmit() {
    const otp = this.getOtp();
    if (otp.length !== 6) return alert('Enter full 6-digit OTP');
    this.onVerify.emit(otp);
  }
}
