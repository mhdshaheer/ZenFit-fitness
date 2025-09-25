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

@Component({
  selector: 'zenfit-category-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-create.component.html',
  styleUrl: './category-create.component.css',
})
export class CategoryCreateComponent {
  activeTab = 'create';
  createForm: FormGroup;
  editForm: FormGroup | null = null;
  categorySelectControl = new FormControl('');
  isSubmitting = false;
  isDeleting = false;

  private _categoryService = inject(CategoryService);
  private _toastService = inject(ToastService);

  constructor(private fb: FormBuilder) {
    this.createForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      description: ['', [Validators.maxLength(500)]],
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
