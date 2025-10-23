import { Component, inject, OnInit, signal } from '@angular/core';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ToastService } from '../../../../core/services/toast.service';
import { ProgramService } from '../../../../core/services/program.service';
import { IProgramsSlotCreate } from '../../../../interface/program.interface';

interface IProgramCreateSlot {
  id: string;
  title: string;
  duration: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}
interface ISlotInput {
  id: string;
  program: IProgramCreateSlot;
  days: string[];
  startTime: string;
  endTime: string;
  status: 'active' | 'inactive';
}

interface TimeOption {
  display: string;
  value: string;
  minutes: number;
}

@Component({
  selector: 'app-trainer-slot-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-slot.component.html',
})
export class CreateSlotComponent implements OnInit {
  // Services
  private _programService = inject(ProgramService);
  private _toastService = inject(ToastService);

  slotForm: FormGroup;
  editForm: FormGroup;
  slots = signal<ISlotInput[]>([]);
  showEditModal = signal(false);
  editingSlot = signal<ISlotInput | null>(null);

  programs: IProgramsSlotCreate[] = [];

  ngOnInit() {
    this._programService.getProgramsForSlotCreate().subscribe({
      next: (res) => {
        this.programs = res;
      },
    });
  }

  timeOptions: TimeOption[] = [];
  filteredEndTimeOptions: TimeOption[] = [];
  filteredEditEndTimeOptions: TimeOption[] = [];

  weekDays = [
    { name: 'Monday', value: 'Mon', selected: false },
    { name: 'Tuesday', value: 'Tue', selected: false },
    { name: 'Wednesday', value: 'Wed', selected: false },
    { name: 'Thursday', value: 'Thu', selected: false },
    { name: 'Friday', value: 'Fri', selected: false },
    { name: 'Saturday', value: 'Sat', selected: false },
    { name: 'Sunday', value: 'Sun', selected: false },
  ];

  editDays = [
    { name: 'Monday', value: 'Mon', selected: false },
    { name: 'Tuesday', value: 'Tue', selected: false },
    { name: 'Wednesday', value: 'Wed', selected: false },
    { name: 'Thursday', value: 'Thu', selected: false },
    { name: 'Friday', value: 'Fri', selected: false },
    { name: 'Saturday', value: 'Sat', selected: false },
    { name: 'Sunday', value: 'Sun', selected: false },
  ];

  constructor(private fb: FormBuilder) {
    this.generateTimeOptions();
    this.filteredEndTimeOptions = [...this.timeOptions];
    this.filteredEditEndTimeOptions = [...this.timeOptions];

    // Create slot form
    this.slotForm = this.fb.group(
      {
        program: ['', Validators.required],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
      },
      {
        validators: [this.endTimeAfterStartTime()],
      }
    );

    // Edit slot form (program is read-only, handled separately)
    this.editForm = this.fb.group(
      {
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
      },
      {
        validators: [this.endTimeAfterStartTimeEdit()],
      }
    );

    // Watch start time changes for create form
    this.slotForm.get('startTime')?.valueChanges.subscribe((startTime) => {
      this.updateEndTimeOptions(startTime);
    });

    // Watch start time changes for edit form
    this.editForm.get('startTime')?.valueChanges.subscribe((startTime) => {
      this.updateEditEndTimeOptions(startTime);
    });

    this.loadDemoSlots();
  }

  generateTimeOptions() {
    const times: TimeOption[] = [];

    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const display12hr = this.formatTime12Hour(hour, minute);
        const minutesFromMidnight = hour * 60 + minute;

        times.push({
          display: display12hr,
          value: display12hr,
          minutes: minutesFromMidnight,
        });
      }
    }

    this.timeOptions = times;
  }

  formatTime12Hour(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const minuteStr = minute.toString().padStart(2, '0');
    return `${hour12}:${minuteStr} ${period}`;
  }

  timeToMinutes(timeStr: string): number {
    const timeOption = this.timeOptions.find((t) => t.value === timeStr);
    return timeOption ? timeOption.minutes : 0;
  }

  updateEndTimeOptions(startTime: string) {
    if (!startTime) {
      this.filteredEndTimeOptions = [...this.timeOptions];
      return;
    }

    const startMinutes = this.timeToMinutes(startTime);
    this.filteredEndTimeOptions = this.timeOptions.filter(
      (time) => time.minutes > startMinutes
    );

    const currentEndTime = this.slotForm.get('endTime')?.value;
    if (currentEndTime) {
      const endMinutes = this.timeToMinutes(currentEndTime);
      if (endMinutes <= startMinutes) {
        this.slotForm.patchValue({ endTime: '' });
      }
    }
  }

  updateEditEndTimeOptions(startTime: string) {
    if (!startTime) {
      this.filteredEditEndTimeOptions = [...this.timeOptions];
      return;
    }

    const startMinutes = this.timeToMinutes(startTime);
    this.filteredEditEndTimeOptions = this.timeOptions.filter(
      (time) => time.minutes > startMinutes
    );

    const currentEndTime = this.editForm.get('endTime')?.value;
    if (currentEndTime) {
      const endMinutes = this.timeToMinutes(currentEndTime);
      if (endMinutes <= startMinutes) {
        this.editForm.patchValue({ endTime: '' });
      }
    }
  }

  endTimeAfterStartTime() {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startTime = formGroup.get('startTime')?.value;
      const endTime = formGroup.get('endTime')?.value;

      if (!startTime || !endTime) {
        return null;
      }

      const startMinutes = this.timeToMinutes(startTime);
      const endMinutes = this.timeToMinutes(endTime);

      if (endMinutes <= startMinutes) {
        return { endTimeBeforeStart: true };
      }

      return null;
    };
  }

  endTimeAfterStartTimeEdit() {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startTime = formGroup.get('startTime')?.value;
      const endTime = formGroup.get('endTime')?.value;

      if (!startTime || !endTime) {
        return null;
      }

      const startMinutes = this.timeToMinutes(startTime);
      const endMinutes = this.timeToMinutes(endTime);

      if (endMinutes <= startMinutes) {
        return { endTimeBeforeStart: true };
      }

      return null;
    };
  }
  checkTimeCollision(
    newSlot: {
      program: IProgramCreateSlot;
      days: string[];
      startTime: string;
      endTime: string;
    },
    excludeSlotId?: string
  ): { hasCollision: boolean; conflictingSlot?: ISlotInput } {
    const newStart = this.timeToMinutes(newSlot.startTime);
    const newEnd = this.timeToMinutes(newSlot.endTime);

    for (const slot of this.slots()) {
      // IMPORTANT: Skip the slot being edited
      if (excludeSlotId && slot.id === excludeSlotId) {
        continue;
      }

      // Only check active slots
      if (slot.status !== 'active') {
        continue;
      }

      // Check if any day overlaps
      const dayOverlap = slot.days.some((day) => newSlot.days.includes(day));

      if (dayOverlap) {
        const existingStart = this.timeToMinutes(slot.startTime);
        const existingEnd = this.timeToMinutes(slot.endTime);

        // Time overlap detection: start1 < end2 AND start2 < end1
        if (newStart < existingEnd && existingStart < newEnd) {
          return {
            hasCollision: true,
            conflictingSlot: slot,
          };
        }
      }
    }

    return { hasCollision: false };
  }

  loadDemoSlots() {
    this.slots.set([
      {
        id: '1',
        program: {
          title: 'Yoga',
          id: '9403942823047230',
          duration: '6 Weeks',
          difficultyLevel: 'Beginner',
        },
        days: ['Mon', 'Wed', 'Fri'],
        startTime: '6:00 AM',
        endTime: '7:00 AM',
        status: 'active',
      },
      {
        id: '2',
        program: {
          title: 'Cardio abs',
          id: '9403942823047230',
          duration: '6 Weeks',
          difficultyLevel: 'Intermediate',
        },
        days: ['Tue', 'Thu'],
        startTime: '5:00 PM',
        endTime: '6:30 PM',
        status: 'active',
      },
      {
        id: '3',
        program: {
          title: 'Cardio',
          id: '9403942823047230',
          duration: '6 Weeks',
          difficultyLevel: 'Advanced',
        },
        days: ['Mon', 'Wed', 'Fri'],
        startTime: '6:00 PM',
        endTime: '7:00 PM',
        status: 'active',
      },
    ]);
  }

  onDayToggle(day: any) {
    day.selected = !day.selected;
  }

  onEditDayToggle(day: any) {
    day.selected = !day.selected;
  }

  getSelectedDays(): string[] {
    return this.weekDays.filter((d) => d.selected).map((d) => d.value);
  }

  getSelectedEditDays(): string[] {
    return this.editDays.filter((d) => d.selected).map((d) => d.value);
  }

  addSlot() {
    if (this.slotForm.invalid) {
      this.showError('Please fill all required fields correctly');
      return;
    }

    const selectedDays = this.getSelectedDays();

    if (selectedDays.length === 0) {
      this.showError('Please select at least one day');
      return;
    }

    const newSlotData = {
      program: this.slotForm.value.program,
      days: selectedDays,
      startTime: this.slotForm.value.startTime,
      endTime: this.slotForm.value.endTime,
    };

    console.log('Form data :', newSlotData);
    // Check for collision (no exclusion needed for new slots)
    const collisionCheck = this.checkTimeCollision(newSlotData);

    if (collisionCheck.hasCollision && collisionCheck.conflictingSlot) {
      const conflict = collisionCheck.conflictingSlot;
      // this._toastService.error(
      //   `❌ SLOT COLLISION DETECTED!\n\n` +
      //     `Cannot create slot: ${newSlotData.startTime} - ${newSlotData.endTime}\n\n` +
      //     `Reason: A slot already exists:\n` +
      //     `• Program: ${conflict.program}\n` +
      //     `• Time: ${conflict.startTime} - ${conflict.endTime}\n` +
      //     `• Days: ${conflict.days.join(', ')}\n\n` +
      //     `Please choose a different time or day.`
      // );
      this._toastService.error(
        `⚠️ Slot Collision!\n` +
          `A slot already exists for ${conflict.program.title} (${conflict.startTime} - ${conflict.endTime}).\n` +
          `Please choose a different time or day.`
      );
      return;
    }

    const newSlot: ISlotInput = {
      id: Date.now().toString(),
      ...newSlotData,
      status: 'active',
    };

    this.slots.update((current) => [...current, newSlot]);
    this.showSuccess('✅ Slot created successfully!');
    this.resetForm();
  }

  resetForm() {
    this.slotForm.reset();
    this.weekDays.forEach((day) => (day.selected = false));
    this.filteredEndTimeOptions = [...this.timeOptions];
  }

  /**
   * Open edit modal - Program is locked to the clicked slot's program
   */
  openEditModal(slot: ISlotInput) {
    const slotCopy = { ...slot };
    this.editingSlot.set(slotCopy);

    // Pre-populate edit form
    this.editForm.patchValue({
      startTime: slotCopy.startTime,
      endTime: slotCopy.endTime,
    });

    // Set selected days
    this.editDays.forEach((day) => {
      day.selected = slotCopy.days.includes(day.value);
    });

    // Update end time options based on start time
    this.updateEditEndTimeOptions(slotCopy.startTime);

    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingSlot.set(null);
    this.editForm.reset();
    this.editDays.forEach((day) => (day.selected = false));
  }

  saveEdit() {
    const edited = this.editingSlot();
    if (!edited) return;

    if (this.editForm.invalid) {
      this.showError('Please fill all fields correctly');
      return;
    }

    const selectedDays = this.getSelectedEditDays();

    if (selectedDays.length === 0) {
      this.showError('Please select at least one day');
      return;
    }

    // Get updated values from form
    const updatedSlot = {
      ...edited,
      days: selectedDays,
      startTime: this.editForm.value.startTime,
      endTime: this.editForm.value.endTime,
    };

    // CRITICAL: Check collision BUT exclude the current slot being edited
    const collisionCheck = this.checkTimeCollision(
      updatedSlot,
      edited.id // ⬅️ Exclude this slot from collision check
    );

    if (collisionCheck.hasCollision && collisionCheck.conflictingSlot) {
      const conflict = collisionCheck.conflictingSlot;
      this.showError(
        `SLOT COLLISION DETECTED!\n\n` +
          `Cannot update to: ${updatedSlot.startTime} - ${updatedSlot.endTime}\n\n` +
          `Reason: Another slot already exists:\n` +
          `• Program: ${conflict.program.id}\n` +
          `• Time: ${conflict.startTime} - ${conflict.endTime}\n` +
          `• Days: ${conflict.days.join(', ')}\n\n` +
          `Please choose a different time or day.`
      );
      return;
    }

    this.slots.update((current) =>
      current.map((slot) => (slot.id === edited.id ? updatedSlot : slot))
    );

    this.showSuccess('✅ Slot updated successfully!');
    this.closeEditModal();
  }

  toggleSlotStatus(slot: ISlotInput) {
    this.slots.update((current) =>
      current.map((s) =>
        s.id === slot.id
          ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
          : s
      )
    );
  }

  deleteSlot(id: string) {
    if (confirm('Are you sure you want to delete this slot?')) {
      this.slots.update((current) => current.filter((slot) => slot.id !== id));
      this.showSuccess('🗑️ Slot deleted successfully!');
    }
  }

  showError(message: string) {
    alert(message);
  }

  showSuccess(message: string) {
    alert(message);
  }

  get isFormInvalid(): boolean {
    return (
      this.slotForm.invalid || this.slotForm.hasError('endTimeBeforeStart')
    );
  }

  get isEditFormInvalid(): boolean {
    return (
      this.editForm.invalid || this.editForm.hasError('endTimeBeforeStart')
    );
  }
}
