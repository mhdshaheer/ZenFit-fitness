import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'zenfit-category-view',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-view.component.html',
  styleUrl: './category-view.component.css',
})
export class CategoryViewComponent {
  activeTab = 'create';
  createForm: FormGroup;
  editForm: FormGroup | null = null;
  categorySelectControl = new FormControl('');

  categories: any[] = []; // Your category list
  isSubmitting = false;
  isDeleting = false;

  constructor(private fb: FormBuilder) {
    // Initialize create form
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

  ngOnInit() {
    // Watch for category selection changes
    this.categorySelectControl.valueChanges.subscribe((categoryId) => {
      if (categoryId) {
        this.loadCategoryForEdit(categoryId);
      } else {
        this.editForm = null;
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'create') {
      this.resetCreateForm();
    }
  }

  // Create form methods
  onCreateCategory() {
    if (this.createForm.valid) {
      this.isSubmitting = true;
      const formValue = this.createForm.value;
    }
  }

  resetCreateForm() {
    this.createForm.reset();
    this.createForm.markAsUntouched();
  }

  // Edit form methods
  loadCategoryForEdit(categoryId: string) {
    const category = this.categories.find((c) => c.id === categoryId);
    if (category) {
      this.editForm = this.fb.group({
        id: [category.id],
        name: [
          category.name,
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(50),
          ],
        ],
        description: [category.description || '', [Validators.maxLength(500)]],
      });
    }
  }

  onUpdateCategory() {
    if (this.editForm && this.editForm.valid && this.editForm.dirty) {
      this.isSubmitting = true;
      const formValue = this.editForm.value;
    }
  }

  onDeleteCategory() {
    if (
      this.editForm &&
      confirm('Are you sure you want to delete this category?')
    ) {
      this.isDeleting = true;
      const categoryId = this.editForm.get('id')?.value;
    }
  }

  cancelEdit() {
    this.categorySelectControl.setValue('');
    this.editForm = null;
  }
}
