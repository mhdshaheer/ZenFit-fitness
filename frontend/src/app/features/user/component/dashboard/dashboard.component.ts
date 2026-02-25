import { Component } from '@angular/core';
import { BmiCalculatorComponent } from '../bmi-calculator/bmi-calculator.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [BmiCalculatorComponent, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent { }
