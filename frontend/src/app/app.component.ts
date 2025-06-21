import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OtpComponent } from './shared/components/otp/otp.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, OtpComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'frontend';
  labelArr: string[] = ['one', 'two'];
}
