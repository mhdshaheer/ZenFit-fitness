import { Component } from '@angular/core';
import { BmiCalculatorComponent } from '../bmi-calculator/bmi-calculator.component';

@Component({
  selector: 'app-dashboard',
  imports: [BmiCalculatorComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
