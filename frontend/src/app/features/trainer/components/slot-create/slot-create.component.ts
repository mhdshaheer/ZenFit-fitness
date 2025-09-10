import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProgramCategory } from '../../store/trainer.model';
import { ProgramService } from '../../../../core/services/program.service';
import { SessionService } from '../../../../core/services/session.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Router } from '@angular/router';

interface SessionSlot {
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
}
@Component({
  selector: 'app-slot-create',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './slot-create.component.html',
  styleUrl: './slot-create.component.css',
})
export class SlotCreateComponent {
  slotForm: FormGroup;
  isSubmitted = false;
  isLoading = false;
  showSuccessMessage = false;
  minDate: string;
  maxDate: string;
  programService = inject(ProgramService);
  sessionService = inject(SessionService);
  toastService = inject(ToastService);
  router = inject(Router);

  programs: ProgramCategory[] = [];

  constructor(private fb: FormBuilder) {
    const today = new Date();
    // Min date
    this.minDate = today.toISOString().split('T')[0];

    // Max Date
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 3);
    this.maxDate = maxDate.toISOString().split('T')[0];

    console.log('minDate : ', this.minDate, this.maxDate);

    this.slotForm = this.fb.group({
      programId: ['', Validators.required],
      duration: [
        60,
        [Validators.required, Validators.min(15), Validators.max(480)],
      ],
      capacity: [
        10,
        [Validators.required, Validators.min(1), Validators.max(100)],
      ],
      timeSlots: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.addTimeSlot();
    this.getProgramCategory();
  }

  get timeSlots(): FormArray {
    return this.slotForm.get('timeSlots') as FormArray;
  }

  createTimeSlotGroup(): FormGroup {
    const group = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });

    const updateEndTime = () => {
      const start = group.get('startTime')?.value;
      const duration = this.slotForm.get('duration')?.value;

      if (start && duration) {
        const [hours, minutes] = start.split(':').map(Number);
        const end = new Date();
        end.setHours(hours, minutes, 0);
        end.setMinutes(end.getMinutes() + duration); // add duration in minutes

        const formattedEnd = end.toTimeString().slice(0, 5);
        group.get('endTime')?.setValue(formattedEnd, { emitEvent: false });
      }
    };

    // Auto-update when startTime changes
    group.get('startTime')?.valueChanges.subscribe(updateEndTime);

    // Auto-update when duration changes
    this.slotForm.get('duration')?.valueChanges.subscribe(updateEndTime);

    console.log('Group : ', group);
    return group;
  }

  addTimeSlot(): void {
    this.timeSlots.push(this.createTimeSlotGroup());
  }

  removeTimeSlot(index: number): void {
    if (this.timeSlots.length > 1) {
      this.timeSlots.removeAt(index);
    }
  }

  getProgramCategory() {
    this.programService.getProgramCategory().subscribe((res) => {
      console.log('response from the backend : ', res.programs);
      this.programs = res.programs;
      this.programs = res.programs.map((p: any) => ({
        ...p,
        _id: p.id.toString(),
      }));
      if (this.programs.length > 0) {
        this.slotForm.patchValue({ programId: this.programs[0]._id }); // ✅ assigns default
      }
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.slotForm.valid && this.timeSlots.length > 0) {
      this.isLoading = true;
      this.onSaveSessions();
      this.router.navigate(['/trainer/programs']);
    } else {
      console.log('Form is invalid or no time slots added');
    }
  }

  onSaveSessions(): void {
    const formData = {
      ...this.slotForm.value,
      timeSlots: this.timeSlots.value,
    };

    console.log('Saving training sessions:', formData);

    this.sessionService.saveSession(formData).subscribe({
      next: (res) => {
        console.log('Training Sessions saved successfully:', res);
        this.toastService.success('Training Sessions saved successfully');
        setTimeout(() => {
          this.router.navigate(['/trainer/programs']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving Training Sessions:', err);
        this.toastService.error('❌ Failed to save Training Sessions');
      },
    });
  }
  onSaveAsDraft(): void {
    const formData = this.slotForm.value;
    console.log('Saving as draft:', formData);
    this.sessionService.saveSessionDraft(formData).subscribe({
      next: (res) => {
        console.log('Training Sessions saved successfully:', res);
        this.toastService.success('Training Sessions saved successfully');
        setTimeout(() => {
          this.router.navigate(['/trainer/programs']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error saving Training sessions:', err);
        this.toastService.error('Failed to save Training sessions');
      },
    });
  }

  onBack(): void {
    console.log('Navigate back to dashboard');
  }

  private resetForm(): void {
    this.slotForm.reset({
      duration: 60,
      capacity: 10,
    });
    this.isSubmitted = false;

    // Clear and add one empty time slot
    while (this.timeSlots.length > 0) {
      this.timeSlots.removeAt(0);
    }
    this.addTimeSlot();
  }
}
