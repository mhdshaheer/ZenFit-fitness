import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CATEGORY_FORM_CONSTANTS } from '../../../../shared/constants/categoryForm.constants';
import { ICategory } from '../../../../interface/category.interface';
import { CategoryService } from '../../../../core/services/category.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { CategoryNameValidator } from '../../../../shared/validators/categoryName.validator';

@Component({
  selector: 'zenfit-category-view',
  imports: [ReactiveFormsModule],
  templateUrl: './category-view.component.html',
  styleUrl: './category-view.component.css',
})
export class CategoryViewComponent {
  editForm: FormGroup;

  isSubmitting = false;
  categoryId!: string;

  // Services
  private _categoryService = inject(CategoryService);
  private _activatedRoute = inject(ActivatedRoute);
  private _toastService = inject(ToastService);
  private _logger = inject(LoggerService);

  private _destroy$ = new Subject<void>();

  constructor(private _fb: FormBuilder) {
    // Initialize create form
    this.editForm = this._fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(CATEGORY_FORM_CONSTANTS.NAME.MIN_LENGTH),
          Validators.maxLength(CATEGORY_FORM_CONSTANTS.NAME.MAX_LENGTH),
        ],
        [CategoryNameValidator(this._categoryService)],
      ],
      description: [
        '',
        [Validators.maxLength(CATEGORY_FORM_CONSTANTS.DESCRIPTION.MAX_LENGTH)],
      ],
    });
  }

  ngOnInit() {
    this.categoryId = this._activatedRoute.snapshot.paramMap.get('id')!;
    this.getCategory();
  }

  // Create form methods
  onEditCategory() {
    if (this.editForm.valid) {
      this.isSubmitting = true;
      const formValue = this.editForm.value;
      this._categoryService
        .updateCategory(this.categoryId, formValue)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            this._logger.info('updated category ', res);
            this._toastService.success('Category updated');

            this.editForm.markAsPristine();
          },
          error: (err) => {
            this._logger.error('Failed to update category', err);
            this._toastService.error('Category Updation Failed');
          },
        });
      this.isSubmitting = false;
    }
  }

  getCategory() {
    this._categoryService
      .getCategory(this.categoryId)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        this.initializeForm(res);
      });
  }
  initializeForm(res: ICategory) {
    this.editForm.patchValue({
      name: res.name,
      description: res.description,
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
