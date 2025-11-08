
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'zenfit-bmi-calculator',
  imports: [FormsModule],
  templateUrl: './bmi-calculator.component.html',
  styleUrl: './bmi-calculator.component.css',
})
export class BmiCalculatorComponent {
  weight: number | null = null;
  height: number | null = null;
  age: number | null = null;
  bmi: number | null = null;
  category: string = '';
  mealPlan: string = '';
  workoutSuggestion: string = '';
  circleColor: string = '#111827';
  progressPercentage: number = 0;

  onInputChange() {
    if (this.weight && this.height) {
      const heightInMeters = this.height / 100;
      this.bmi = this.weight / (heightInMeters * heightInMeters);

      // Calculate progress percentage (BMI 15-40 mapped to 0-100%)
      this.progressPercentage = Math.min(
        Math.max(((this.bmi - 15) / 25) * 100, 0),
        100
      );

      // Determine category and color
      if (this.bmi < 18.5) {
        this.category = 'Underweight';
        this.circleColor = '#d1d5db';
        this.mealPlan =
          'Focus on high-protein meals with healthy fats, nuts, whole grains, and calorie-dense foods to support healthy weight gain';
        this.workoutSuggestion =
          'Strength training and resistance exercises to build muscle mass. Include compound movements like squats, deadlifts, and bench press';
      } else if (this.bmi >= 18.5 && this.bmi < 25) {
        this.category = 'Normal';
        this.circleColor = '#111827';
        this.mealPlan =
          'Maintain a balanced diet with lean proteins, whole grains, fruits, vegetables, and healthy fats for optimal health';
        this.workoutSuggestion =
          'Continue with a balanced fitness routine combining cardio (3x/week) and strength training (2-3x/week) for maintenance';
      } else if (this.bmi >= 25 && this.bmi < 30) {
        this.category = 'Overweight';
        this.circleColor = '#6b7280';
        this.mealPlan =
          'Reduce calorie intake with portion control. Focus on vegetables, lean proteins, whole grains, and limit processed foods';
        this.workoutSuggestion =
          'Increase cardio to 4-5x/week (brisk walking, jogging, cycling) combined with strength training 2-3x/week';
      } else {
        this.category = 'Obese';
        this.circleColor = '#374151';
        this.mealPlan =
          'Follow a structured low-calorie meal plan with high fiber, lean proteins, and plenty of water. Consider consulting a nutritionist';
        this.workoutSuggestion =
          'Start with low-impact activities like walking or swimming for 30-45 minutes daily. Gradually increase intensity';
      }
    } else {
      this.bmi = null;
      this.category = '';
      this.mealPlan = '';
      this.workoutSuggestion = '';
      this.progressPercentage = 0;
    }
  }
}
