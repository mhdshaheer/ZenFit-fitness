import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryService } from '../../../../core/services/category.service';
import { ICategory } from '../../../../interface/category.interface';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';
import { CATEGORY_FORM_CONSTANTS } from '../../../../shared/constants/categoryForm.constants';
import { CategoryNameValidator } from '../../../../shared/validators/categoryName.validator';

@Component({
  selector: 'zenfit-category-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-create.component.html',
  styleUrl: './category-create.component.css',
})
export class CategoryCreateComponent {
  createForm: FormGroup;
  editForm: FormGroup | null = null;
  categorySelectControl = new FormControl('');
  isSubmitting = false;
  isDeleting = false;

  private _categoryService = inject(CategoryService);
  private _toastService = inject(ToastService);
  private router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(CATEGORY_FORM_CONSTANTS.NAME.MIN_LENGTH),
          Validators.maxLength(CATEGORY_FORM_CONSTANTS.NAME.MAX_LENGTH),
          Validators.pattern(CATEGORY_FORM_CONSTANTS.NAME.PATTERN),
        ],
        [CategoryNameValidator(this._categoryService)],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(CATEGORY_FORM_CONSTANTS.DESCRIPTION.MAX_LENGTH),
          Validators.pattern(CATEGORY_FORM_CONSTANTS.DESCRIPTION.PATTERN),
        ],
      ],
    });
  }

  // ✅ Create form submission
  onCreateCategory() {
    if (this.createForm.valid) {
      this.isSubmitting = true;
      const formValue = this.createForm.value;

      this._categoryService.createCategory(formValue).subscribe({
        next: (res: ICategory) => {
          console.log('Category created:', res);
          this._toastService.success('Category is created');
          this.resetCreateForm();
          this.router.navigate(['/admin/category']);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Failed to create category', err);
          this._toastService.error('Failed to create category');
          this.isSubmitting = false;
        },
      });
    }
  }

  resetCreateForm() {
    this.createForm.reset();
    this.createForm.markAsUntouched();
  }
}
