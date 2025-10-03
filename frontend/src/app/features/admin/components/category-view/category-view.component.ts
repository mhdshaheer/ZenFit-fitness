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
  private categoryService = inject(CategoryService);
  private activatedRoute = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private logger = inject(LoggerService);

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {
    // Initialize create form
    this.editForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(CATEGORY_FORM_CONSTANTS.NAME.MIN_LENGTH),
          Validators.maxLength(CATEGORY_FORM_CONSTANTS.NAME.MAX_LENGTH),
        ],
      ],
      description: [
        '',
        [Validators.maxLength(CATEGORY_FORM_CONSTANTS.DESCRIPTION.MAX_LENGTH)],
      ],
    });
  }

  ngOnInit() {
    this.categoryId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.getCategory();
  }

  // Create form methods
  onEditCategory() {
    if (this.editForm.valid) {
      this.isSubmitting = true;
      const formValue = this.editForm.value;
      this.categoryService
        .updateCategory(this.categoryId, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            this.logger.info('updated category ', res);
            this.toastService.success('Category updated');

            this.editForm.markAsPristine();
          },
          error: (err) => {
            this.logger.error('Failed to update category', err);
            this.toastService.error('Category Updation Failed');
          },
        });
      this.isSubmitting = false;
    }
  }

  getCategory() {
    this.categoryService
      .getCategory(this.categoryId)
      .pipe(takeUntil(this.destroy$))
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}
