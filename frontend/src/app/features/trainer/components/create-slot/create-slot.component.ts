import { MatDialog } from '@angular/material/dialog';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { SlotService } from '../../../../core/services/slot.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ProgramService } from '../../../../core/services/program.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  IDifficultyLevel,
  IProgramsSlotCreate,
} from '../../../../interface/program.interface';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  IDay,
  IProgramCreateSlot,
  ISlotInput,
  ISlotOutput,
  ISlotStatus,
  TimeOption,
} from '../../../../interface/slot.interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-trainer-slot-management',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './create-slot.component.html',
})
export class CreateSlotComponent implements OnInit, OnDestroy {
  // Services
  private readonly _programService = inject(ProgramService);
  private readonly _slotService = inject(SlotService);
  private readonly _toastService = inject(ToastService);
  private readonly _loggerService = inject(LoggerService);
  private readonly _dialog = inject(MatDialog);
  private _destroy$ = new Subject<void>();

  slotForm: FormGroup;
  editForm: FormGroup;

  slots = signal<ISlotOutput[]>([]);

  showEditModal = signal(false);
  editingSlot = signal<ISlotOutput | null>(null);

  programs: IProgramsSlotCreate[] = [];

  ngOnInit() {
    this.getPrograms();
    this.getSlots();
  }

  getPrograms() {
    this._programService
      .getProgramsForSlotCreate()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.programs = res;
        },
      });
  }
  getSlots() {
    this._slotService
      .getSlotByTrainer()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._loggerService.info('Slots are :', res);
          this.slots.set(res);
        },
      });
  }

  timeOptions: TimeOption[] = [];
  filteredEndTimeOptions: TimeOption[] = [];
  filteredEditEndTimeOptions: TimeOption[] = [];

  weekDays: IDay[] = [
    { name: 'Monday', value: 'Mon', selected: false },
    { name: 'Tuesday', value: 'Tue', selected: false },
    { name: 'Wednesday', value: 'Wed', selected: false },
    { name: 'Thursday', value: 'Thu', selected: false },
    { name: 'Friday', value: 'Fri', selected: false },
    { name: 'Saturday', value: 'Sat', selected: false },
    { name: 'Sunday', value: 'Sun', selected: false },
  ];

  editDays: IDay[] = [
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
        capacity: [
          1,
          [Validators.required, Validators.min(1), Validators.max(20)],
        ],
        endTime: ['', Validators.required],
      },
      {
        validators: [this.endTimeAfterStartTime()],
      }
    );

    this.editForm = this.fb.group(
      {
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
        capacity: [
          ,
          [Validators.required, Validators.min(1), Validators.max(20)],
        ],
      },
      {
        validators: [this.endTimeAfterStartTimeEdit()],
      }
    );
    this.slotForm
      .get('startTime')
      ?.valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe((startTime) => {
        this.updateEndTimeOptions(startTime);
      });
    this.editForm
      .get('startTime')
      ?.valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe((startTime) => {
        this.updateEditEndTimeOptions(startTime);
      });
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
  ): { hasCollision: boolean; conflictingSlot?: ISlotOutput } {
    const newStart = this.timeToMinutes(newSlot.startTime);
    const newEnd = this.timeToMinutes(newSlot.endTime);

    for (const slot of this.slots()) {
      if (excludeSlotId && slot.id === excludeSlotId) {
        continue;
      }
      if (slot.status !== 'active') {
        continue;
      }

      const dayOverlap = slot.days.some((day) => newSlot.days.includes(day));

      if (dayOverlap) {
        const existingStart = this.timeToMinutes(slot.startTime);
        const existingEnd = this.timeToMinutes(slot.endTime);
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

  onDayToggle(day: IDay) {
    day.selected = !day.selected;
  }

  onEditDayToggle(day: IDay) {
    day.selected = !day.selected;
  }

  getSelectedDays(): string[] {
    return this.weekDays.filter((d) => d.selected).map((d) => d.value);
  }

  getSelectedEditDays(): string[] {
    return this.editDays.filter((d) => d.selected).map((d) => d.value);
  }

  private _mapToSlotProgram(program: IProgramsSlotCreate): IProgramCreateSlot {
    return {
      id: program.id,
      title: program.title,
      duration: program.duration,
      difficultyLevel: program.difficultyLevel as IDifficultyLevel,
    };
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

    const selectedProgramId = this.slotForm.value.program;
    const selectedProgram = this.programs.find(
      (p) => p.id === selectedProgramId
    );

    if (!selectedProgram) {
      this.showError('Invalid program selected');
      return;
    }

    const newSlotData = {
      program: this._mapToSlotProgram(selectedProgram),
      days: selectedDays,
      capacity: this.slotForm.value.capacity,
      startTime: this.slotForm.value.startTime,
      endTime: this.slotForm.value.endTime,
    };

    const collisionCheck = this.checkTimeCollision(newSlotData);

    if (collisionCheck.hasCollision && collisionCheck.conflictingSlot) {
      const conflict = collisionCheck.conflictingSlot;
      this._toastService.info(
        `Slot conflict with ${conflict.program.title} (${conflict.startTime} - ${conflict.endTime})`
      );
      return;
    }
    const slotInput: ISlotInput = {
      programId: selectedProgramId,
      days: selectedDays,
      capacity: this.slotForm.value.capacity,
      startTime: this.slotForm.value.startTime,
      endTime: this.slotForm.value.endTime,
    };

    this._slotService
      .createSlot(slotInput)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this.slots.update((current) => [...current, res]);
          this.showSuccess('Slot created successfully!');
          this.resetForm();
        },
        error: (err) => {
          this.showError('Failed to create slot');
          this._loggerService.error(err);
        },
      });
  }

  resetForm() {
    this.slotForm.reset();
    this.weekDays.forEach((day) => (day.selected = false));
    this.filteredEndTimeOptions = [...this.timeOptions];
  }

  openEditModal(slot: ISlotOutput) {
    const slotCopy = { ...slot };
    this.editingSlot.set(slotCopy);

    this.editForm.patchValue({
      startTime: slotCopy.startTime,
      endTime: slotCopy.endTime,
      capacity: slotCopy.capacity,
    });

    this.editDays.forEach((day) => {
      day.selected = slotCopy.days.includes(day.value);
    });

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
    const updatedSlot = {
      ...edited,
      days: selectedDays,
      capacity: this.editForm.value.capacity,
      startTime: this.editForm.value.startTime,
      endTime: this.editForm.value.endTime,
    };
    const collisionCheck = this.checkTimeCollision(updatedSlot, edited.id);

    if (collisionCheck.hasCollision && collisionCheck.conflictingSlot) {
      const conflict = collisionCheck.conflictingSlot;
      this.showError(
        `Slot conflict with ${conflict.program.title} (${conflict.startTime} - ${conflict.endTime})`
      );
      return;
    }
    const updateInput: ISlotInput = {
      programId: edited.program.id,
      days: selectedDays,
      capacity: this.editForm.value.capacity,
      startTime: this.editForm.value.startTime,
      endTime: this.editForm.value.endTime,
    };
    this._slotService
      .updateSlotById(edited.id, updateInput)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res: ISlotOutput) => {
          this.slots.update((current) =>
            current.map((slot) => (slot.id === edited.id ? res : slot))
          );

          this.showSuccess('Slot updated successfully!');
          this.closeEditModal();
        },
        error: (err) => {
          this.showError('Failed to update slot');
          this._loggerService.error(err);
        },
      });
  }
  statusChange(slotId: string, slotStatus: ISlotStatus): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: slotStatus === 'inactive' ? 'Block Slot' : 'Activate slot',
        message: `Are you sure you want to ${slotStatus} this slot?`,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._destroy$))
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          const newStatus = slotStatus === 'active' ? 'inactive' : 'active';

          this._slotService
            .updateSlotStatus(slotId, newStatus)
            .pipe(takeUntil(this._destroy$))
            .subscribe({
              next: (updatedSlot: ISlotOutput) => {
                this._loggerService.info('status updated : ', updatedSlot);
                this.slots.update((current) =>
                  current.map((slot) =>
                    slot.id === slotId ? updatedSlot : slot
                  )
                );
                this.showSuccess('Slot updated successfully!');
              },
              error: (err) => {
                this.showError('Failed to update slot');
                this._loggerService.error('Failed to update slot status:', err);
              },
            });
        }
      });
  }

  showError(message: string) {
    this._toastService.error(message);
  }

  showSuccess(message: string) {
    this._toastService.success(message);
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
  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
