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
import { ProfileService } from '../../../../core/services/profile.service';
import { ILoggedUser, IUserResponse } from '../../../../interface/user.interface';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { LoggerService } from '../../../../core/services/logger.service';

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
  private readonly _programService = inject(ProgramService);
  private readonly _toastService = inject(ToastService);
  private readonly _router = inject(Router);
  private readonly _categoryService = inject(CategoryService);
  private readonly _profileService = inject(ProfileService);
  private readonly _destroy$ = new Subject<void>();
  private _logger = inject(LoggerService)

  programForm!: FormGroup;
  characterCount = 0;
  isSubmitting = false;
  currentTrainerId = '';
  categories: Category[] = [];
  isTrainerVerified = true;

  private readonly _fb = inject(FormBuilder);



  ngOnInit() {
    this.initializeForm();
    this.generateProgramId();
    this.getSubCategories();
    this.checkTrainerVerification();
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }

  checkTrainerVerification() {
    this._profileService.getCurrentUserId()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (user: ILoggedUser) => {
          this.currentTrainerId = user.id;
          this._profileService.getProfile(user.id)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
              next: (profile: IUserResponse) => {
                this.isTrainerVerified = profile.resumeVerified || false;
                if (!this.isTrainerVerified) {
                  this._logger.info('Trainer is not verified. Program execution blocked.');
                  this._toastService.info('Please note: You must be verified to submit programs. You can still arrange drafts.');
                }
              },
              error: (err: Error) => this._logger.error('Failed to fetch profile status:', err)
            });
        },
        error: (err: Error) => this._logger.error('Failed to fetch user context:', err)
      });
  }

  getSubCategories() {
    this._categoryService
      .getSubcateories()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: ICategory[]) => {
          this.categories = res.map((item) => ({
            value: item._id,
            label: item.name,
          }));
        },
        error: (err) => {
          this._logger.error('Failed to fetch subcategories ', err);
        },
      });
  }

  initializeForm() {
    this.programForm = this._fb.group({
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
    if (!this.isTrainerVerified) {
      this._toastService.error('Your profile must be verified by an admin before you can create programs.');
      return;
    }

    if (this.programForm.valid) {
      this.isSubmitting = true;

      const programData: Program = {
        ...this.programForm.value,
        trainerId: this.currentTrainerId,
        status: 'active',
      };

      this._programService
        .saveProgram(programData)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: () => {
            this._toastService.success('Training Program saved successfully');
            this.isSubmitting = false;
            this.resetForm();
            this._router.navigate(['/trainer/programs']);
          },
          error: (err) => {
            this._logger.error('Error saving Training Program:', err);
            this._toastService.error('Failed to save Training Program');
            this.isSubmitting = false;
          },
        });
    } else {
      this.markFormGroupTouched();
      this._logger.error('Form is invalid');
    }
  }

  saveDraft() {
    this.isSubmitting = true;

    const draftData: Program = {
      ...this.programForm.value,
      trainerId: this.currentTrainerId,
      status: 'draft',
    };

    this._programService
      .saveProgramDraft(draftData)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this._toastService.success('Draft saved successfully');
          this.isSubmitting = false;
          this.resetForm();
          this._router.navigate(['/trainer/programs']);
        },
        error: (err) => {
          this._logger.error('Error saving draft:', err);
          this._toastService.error('Failed to save draft');
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
        this._logger.info(`${key} is invalid:`, control.errors);
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
