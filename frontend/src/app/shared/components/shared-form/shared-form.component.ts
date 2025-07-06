import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-shared-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './shared-form.component.html',
  styleUrl: './shared-form.component.css',
})
export class SharedFormComponent {
  @Input() label!: string;
  @Input() type: 'text' | 'email' | 'password' = 'text';
  @Input() controlName!: string;
  @Input() formGroup!: FormGroup;
  @Input() placeholder: string = '';

  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  // passwordMatchValidator(form: FormGroup) {
  //   const password = form.get('password')?.value;
  //   const confirmPassword = form.get('confirmPassword')?.value;
  //   return password === confirmPassword ? null : { mismatch: true };
  // }

  get currentType() {
    return this.type === 'password'
      ? this.showPassword
        ? 'text'
        : 'password'
      : this.type;
  }
  get control(): FormControl {
    return this.formGroup.get(this.controlName) as FormControl;
  }
  get inputType() {
    return this.type === 'password' && !this.showPassword ? 'password' : 'text';
  }
}
