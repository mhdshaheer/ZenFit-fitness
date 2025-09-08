import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProgramService } from '../../../../core/services/program.service';
import { Program } from '../../store/trainer.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-program-create',
  imports: [ReactiveFormsModule],
  templateUrl: './program-create.component.html',
  styleUrl: './program-create.component.css',
})
export class ProgramCreateComponent implements OnInit {
  programService = inject(ProgramService);
  toastService = inject(ToastService);
  programForm!: FormGroup;
  characterCount = 0;
  isSubmitting = false;
  currentTrainerId = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.generateProgramId();
  }

  initializeForm() {
    this.programForm = this.fb.group({
      programId: ['', [Validators.required, Validators.minLength(3)]],
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      description: ['', [Validators.maxLength(500)]],
      category: [''],
      difficultyLevel: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      duration: [''],
      status: ['draft'],
    });

    // Watch description changes for character count
    this.programForm.get('description')?.valueChanges.subscribe((value) => {
      this.characterCount = value ? value.length : 0;
    });
  }

  generateProgramId() {
    // Auto-generate a unique program ID
    const currentYear = new Date().getFullYear();
    const randomNumber = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    const programId = `FIT-${currentYear}-${randomNumber}`;
    this.programForm.patchValue({ programId });
  }

  updateCharacterCount() {
    const description = this.programForm.get('description')?.value || '';
    this.characterCount = description.length;
  }

  onSubmit() {
    if (this.programForm.valid) {
      this.isSubmitting = true;

      const programData: Program = {
        ...this.programForm.value,
        trainerId: this.currentTrainerId,
        status: 'active',
      };

      this.programService.saveProgram(programData).subscribe({
        next: (res) => {
          console.log('Training Program saved successfully:', res);
          this.toastService.success('Training Program saved successfully');
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error saving Training Program:', err);
          this.toastService.error('Failed to save Training Program');
          this.isSubmitting = false;
        },
      });
    } else {
      this.markFormGroupTouched();
      console.log('Form is invalid');
    }
  }

  saveDraft() {
    this.isSubmitting = true;

    const draftData: Program = {
      ...this.programForm.value,
      trainerId: this.currentTrainerId,
      status: 'draft',
    };

    this.programService.saveProgramDraft(draftData).subscribe({
      next: (res) => {
        console.log('Draft saved successfully:', res);
        this.toastService.success('Draft saved successfully');
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error saving draft:', err);
        this.toastService.error('Failed to save draft');
        this.isSubmitting = false;
      },
    });
  }

  resetForm() {
    this.programForm.reset();
    this.characterCount = 0;
    this.generateProgramId();
    this.programForm.patchValue({ status: 'draft' });
  }

  private markFormGroupTouched() {
    Object.keys(this.programForm.controls).forEach((key) => {
      const control = this.programForm.get(key);
      control?.markAsTouched();

      if (control?.invalid) {
        console.log(`${key} is invalid:`, control.errors);
      }
    });
  }

  // Utility methods for form validation feedback
  isFieldInvalid(fieldName: string): boolean {
    const field = this.programForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.programForm.get(fieldName);

    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName} must be less than ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName} must be greater than ${field.errors['min'].min}`;
      }
    }

    return null;
  }

  // Method to check if form has unsaved changes
  hasUnsavedChanges(): boolean {
    return this.programForm.dirty;
  }

  // Method to get form data for preview
  getFormData(): Program {
    return {
      ...this.programForm.value,
      trainerId: this.currentTrainerId,
    };
  }
}
