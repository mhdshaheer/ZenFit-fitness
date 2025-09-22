import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProgramCategory } from '../../store/trainer.model';
import { ProgramService } from '../../../../core/services/program.service';
import { SessionService } from '../../../../core/services/session.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../../core/services/category.service';

interface TimeSlot {
  date: string;
  startTime: string;
  endTime: string;
  displayDate: string;
  displayStartTime: string;
  displayEndTime: string;
}

@Component({
  selector: 'app-slot-create',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './slot-create.component.html',
  styleUrl: './slot-create.component.css',
})
export class SlotCreateComponent {
  slotForm: FormGroup;
  slotInputForm: FormGroup;
  isSubmitted = false;
  isLoading = false;
  showSuccessMessage = false;
  minDate: string;
  maxDate: string;

  // Services
  programService = inject(ProgramService);
  sessionService = inject(SessionService);
  categoryService = inject(CategoryService);
  toastService = inject(ToastService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  programs: ProgramCategory[] = [];
  timeSlots: TimeSlot[] = [];
  programId!: string;
  categoryName!: string;

  constructor(private fb: FormBuilder) {
    // Get CategoryId from params
    this.route.paramMap.subscribe((params) => {
      this.programId = params.get('id') as string;
    });

    // Set date constraints
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 30); // Allow booking 30 days ahead
    this.maxDate = maxDate.toISOString().split('T')[0];

    // Main form for program details
    this.slotForm = this.fb.group({
      programId: [this.programId, Validators.required],
      duration: [
        60,
        [Validators.required, Validators.min(15), Validators.max(480)],
      ],
      capacity: [
        10,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
    });

    // Separate form for time slot input
    this.slotInputForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: [''],
    });

    // Auto-update end time when start time or duration changes
    this.slotInputForm.get('startTime')?.valueChanges.subscribe(() => {
      this.updateEndTime();
    });

    this.slotForm.get('duration')?.valueChanges.subscribe(() => {
      this.updateEndTime();
    });
  }

  ngOnInit(): void {
    this.getProgramCategory(this.programId);
  }

  updateEndTime(): void {
    const startTime = this.slotInputForm.get('startTime')?.value;
    const duration = this.slotForm.get('duration')?.value || 60;

    if (startTime) {
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate.getTime() + duration * 60000);
      const endTime = endDate.toTimeString().slice(0, 5);

      this.slotInputForm
        .get('endTime')
        ?.setValue(endTime, { emitEvent: false });
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime12Hour(timeString: string): string {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${displayHour}:${minutes} ${ampm}`;
  }

  addTimeSlot(): void {
    if (this.slotInputForm.valid) {
      const formValue = this.slotInputForm.value;

      // Check for duplicates
      const duplicate = this.timeSlots.find(
        (slot) =>
          slot.date === formValue.date && slot.startTime === formValue.startTime
      );

      if (duplicate) {
        this.toastService.error('This time slot already exists');
        return;
      }

      // Add new time slot
      const newSlot: TimeSlot = {
        date: formValue.date,
        startTime: formValue.startTime,
        endTime: formValue.endTime,
        displayDate: this.formatDate(formValue.date),
        displayStartTime: this.formatTime12Hour(formValue.startTime),
        displayEndTime: this.formatTime12Hour(formValue.endTime),
      };

      this.timeSlots.push(newSlot);
      this.clearSlotInputs();
      this.toastService.success('Time slot added successfully');
    } else {
      this.toastService.error('Please fill in all required fields');
    }
  }

  removeTimeSlot(index: number): void {
    this.timeSlots.splice(index, 1);
    this.toastService.success('Time slot removed');
  }

  clearSlotInputs(): void {
    this.slotInputForm.reset();
  }

  getProgramCategory(programId: string): void {
    this.programService.getProgramByProgramId(programId).subscribe({
      next: (res) => {
        console.log('Program is :', res);
        let categoryData = JSON.parse(res.category);
        this.categoryName = categoryData.name;
        console.log('JSON data : ', categoryData._id);
      },
      error: (err) => {
        console.error('Error loading programs:', err);
        this.toastService.error('Failed to load programs');
      },
    });
  }

  validateForm(): boolean {
    this.isSubmitted = true;

    if (this.slotForm.invalid) {
      this.toastService.error('Please fill in all required program details');
      return false;
    }

    if (this.timeSlots.length === 0) {
      this.toastService.error('Please add at least one time slot');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.onSaveSessions();
  }

  onSaveSessions(): void {
    const formData = {
      ...this.slotForm.value,
      timeSlots: this.timeSlots.map((slot) => ({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    };

    console.log('Saving training sessions:', formData);

    this.sessionService.saveSession(formData).subscribe({
      next: (res) => {
        console.log('Training Sessions saved successfully:', res);
        this.showSuccessMessage = true;
        this.toastService.success('Training Sessions created successfully');

        setTimeout(() => {
          this.router.navigate(['/trainer/programs']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving Training Sessions:', err);
        this.toastService.error('❌ Failed to save Training Sessions');
        this.isLoading = false;
      },
    });
  }

  onSaveAsDraft(): void {
    const formData = {
      ...this.slotForm.value,
      timeSlots: this.timeSlots.map((slot) => ({
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      })),
    };

    console.log('Saving as draft:', formData);

    this.sessionService.saveSessionDraft(formData).subscribe({
      next: (res) => {
        console.log('Draft saved successfully:', res);
        this.toastService.success('Draft saved successfully');

        setTimeout(() => {
          this.router.navigate(['/trainer/programs']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving draft:', err);
        this.toastService.error('Failed to save draft');
      },
    });
  }

  onBack(): void {
    if (this.timeSlots.length > 0 || this.slotForm.dirty) {
      if (
        confirm('You have unsaved changes. Are you sure you want to go back?')
      ) {
        this.router.navigate(['/trainer/programs']);
      }
    } else {
      this.router.navigate(['/trainer/programs']);
    }
  }

  resetForm(): void {
    this.slotForm.reset({
      duration: 60,
      capacity: 10,
    });
    this.slotInputForm.reset();
    this.timeSlots = [];
    this.isSubmitted = false;
    this.isLoading = false;
    this.showSuccessMessage = false;
  }

  // Helper methods for template
  get slotCount(): string {
    return `${this.timeSlots.length} slot${
      this.timeSlots.length !== 1 ? 's' : ''
    }`;
  }

  get hasTimeSlots(): boolean {
    return this.timeSlots.length > 0;
  }

  // Form validation helpers
  isFieldInvalid(
    fieldName: string,
    formGroup: FormGroup = this.slotForm
  ): boolean {
    const field = formGroup.get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.isSubmitted)
    );
  }

  getFieldError(
    fieldName: string,
    formGroup: FormGroup = this.slotForm
  ): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} is too low`;
      if (field.errors['max']) return `${fieldName} is too high`;
    }
    return '';
  }
}
