import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProgramService } from '../../../../core/services/program.service';
import { Program } from '../../store/trainer.model';
import { ToastService } from '../../../../core/services/toast.service';
import {
  CategoryService,
  ICategory,
} from '../../../../core/services/category.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

export interface Category {
  value: string;
  label: string;
}

@Component({
  selector: 'app-program-create',
  imports: [ReactiveFormsModule],
  templateUrl: './program-create.component.html',
  styleUrl: './program-create.component.css',
})
export class ProgramCreateComponent implements OnInit, OnDestroy {
  programService = inject(ProgramService);
  toastService = inject(ToastService);
  router = inject(Router);
  categoryService = inject(CategoryService);

  programForm!: FormGroup;
  characterCount = 0;
  isSubmitting = false;
  currentTrainerId = '';
  categories: Category[] = [];

  private _destroy$ = new Subject<void>(); // ✅ for cleanup

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.generateProgramId();
    this.getSubCategories();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
    console.log('Unsubscribed all streams ✅');
  }

  getSubCategories() {
    this.categoryService
      .getSubcateories()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: ICategory[]) => {
          console.log('sub categories are ..:', res);
          this.categories = res.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        },
        error: (err) => {
          console.log('Failed to fetch subcategories ', err);
        },
      });
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

    // Watch description changes
    this.programForm
      .get('description')
      ?.valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe((value) => {
        this.characterCount = value ? value.length : 0;
      });
  }

  generateProgramId() {
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

      this.programService
        .saveProgram(programData)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            console.log('Training Program saved successfully:', res);
            this.toastService.success('Training Program saved successfully');
            this.isSubmitting = false;
            this.resetForm();
            this.router.navigate(['/trainer/programs']);
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

    this.programService
      .saveProgramDraft(draftData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          console.log('Draft saved successfully:', res);
          this.toastService.success('Draft saved successfully');
          this.isSubmitting = false;
          this.resetForm();
          this.router.navigate(['/trainer/programs']);
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

  hasUnsavedChanges(): boolean {
    return this.programForm.dirty;
  }

  getFormData(): Program {
    return {
      ...this.programForm.value,
      trainerId: this.currentTrainerId,
    };
  }
}
