import { Component, inject } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CategoryService,
  ICategory,
} from '../../../../core/services/category.service';
import { Program } from '../../store/trainer.model';
import { LoggerService } from '../../../../core/services/logger.service';

export interface Category {
  value: string;
  label: string;
}
@Component({
  selector: 'app-program-view',
  imports: [ReactiveFormsModule],
  templateUrl: './program-view.component.html',
  styleUrl: './program-view.component.css',
})
export class ProgramViewComponent {
  programService = inject(ProgramService);
  toastService = inject(ToastService);
  router = inject(Router);
  programForm!: FormGroup;
  characterCount = 0;
  isSubmitting = false;
  currentTrainerId = '';
  categoryService = inject(CategoryService);
  route = inject(ActivatedRoute);
  logger = inject(LoggerService);
  programId!: string;
  isEditMode = false;
  category: Category = {
    value: '',
    label: '',
  };

  categories: Category[] = [];

  constructor(private fb: FormBuilder) {
    this.route.paramMap.subscribe((params) => {
      this.programId = params.get('id') as string;
    });
  }

  getSubCategories() {
    this.categoryService.getSubcateories().subscribe({
      next: (res: ICategory[]) => {
        console.log('sub categories are ..:', res);
        this.categories = res.map((item) => {
          return {
            value: item._id,
            label: item.name,
          };
        });
      },
      error: (err) => {
        console.log('Failed to fetch subcategories ', err);
      },
    });
  }
  ngOnInit() {
    this.initializeForm();
    this.getSubCategories();
    this.getProgram();
  }

  getProgram() {
    this.programService.getProgramByProgramId(this.programId).subscribe({
      next: (res: Program) => {
        this.logger.info('Program :', res);
        let val = JSON.parse(res.category);
        this.category = {
          value: val._id,
          label: val.name,
        };

        this.programForm.patchValue(res);
      },
      error: (err) => {
        this.logger.error('Failed to fetch program :', err);
      },
    });
  }

  initializeForm() {
    this.programForm = this.fb.group({
      programId: [, [Validators.required, Validators.minLength(3)]],
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

      this.programService.updateProgram(this.programId, programData).subscribe({
        next: (res) => {
          this.toastService.success('Program data is updated');
          this.logger.info('response:', res);
        },
        error: (err) => {
          this.toastService.error('Updation failed');
          this.logger.info('Updation failed:', err);
        },
      });
    } else {
      this.markFormGroupTouched();
      console.log('Form is invalid');
    }
  }

  resetForm() {
    this.programForm.reset();
    this.characterCount = 0;
    // this.generateProgramId();
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

  onEdit() {
    this.isEditMode = true;
  }
}
