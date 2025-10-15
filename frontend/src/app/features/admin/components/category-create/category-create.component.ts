import { Component, inject, OnDestroy, OnInit } from '@angular/core';

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
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'zenfit-category-create',
  imports: [ReactiveFormsModule],
  templateUrl: './category-create.component.html',
  styleUrl: './category-create.component.css',
})
export class CategoryCreateComponent implements OnInit, OnDestroy {
  createForm: FormGroup;
  editForm: FormGroup | null = null;
  categorySelectControl = new FormControl('');
  isSubmitting = false;
  isDeleting = false;
  isSubcategory = false;
  categories: ICategory[] = [];

  private _categoryService = inject(CategoryService);
  private _toastService = inject(ToastService);
  private _router = inject(Router);

  private _destroy$ = new Subject<void>();

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
      parantId: [null],
    });
  }

  ngOnInit() {
    this.getCategory();
  }
  // ✅ Create form submission
  onCreateCategory() {
    if (this.createForm.valid) {
      console.log('form data :', this.createForm.value);
      this.isSubmitting = true;
      const formValue = this.createForm.value;

      this._categoryService
        .createCategory(formValue)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res: ICategory) => {
            console.log('Category created:', res);
            this._toastService.success('Category is created');
            this.resetCreateForm();
            this._router.navigate(['/admin/category']);
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

  onCategory() {
    this.isSubcategory = !this.isSubcategory;
    if (this.isSubcategory) {
      this.createForm.get('parantId')?.setValidators([Validators.required]);
    } else {
      this.createForm.get('parantId')?.clearValidators();
      this.createForm.get('parantId')?.setValue(null);
    }
    this.createForm.get('parantId')?.updateValueAndValidity();
  }

  getCategory() {
    this._categoryService.getCategories().subscribe({
      next: (res: ICategory[]) => {
        console.log('Categories are : ', res);
        this.categories = res;
        console.log(this.categories);
      },
      error: (err) => {
        console.log('Failed to fetch categories ', err);
      },
    });
  }
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
