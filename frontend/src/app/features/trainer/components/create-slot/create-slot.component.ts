import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { SlotService } from '../../../../core/services/slot.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ProgramService } from '../../../../core/services/program.service';
import {
  ISlotTemplateResponse,
  ICreateSlotTemplatePayload,
  SlotRecurrence,
  RecurrenceType,
  TimeOption,
  ISlotInstancePublic,
  IDay,
  ISlotInstancePaginationMeta,
} from '../../../../interface/slot.interface';
import { IProgramsSlotCreate } from '../../../../interface/program.interface';
import Swal from 'sweetalert2';

type InstanceStatusFilter = 'ALL' | 'OPEN' | 'CLOSED' | 'CANCELLED';

@Component({
  selector: 'app-trainer-slot-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePipe],
  templateUrl: './create-slot.component.html',
})
export class CreateSlotComponent implements OnInit, OnDestroy {
  private readonly _programService = inject(ProgramService);
  private readonly _slotService = inject(SlotService);
  private readonly _toastService = inject(ToastService);
  private readonly _loggerService = inject(LoggerService);
  private readonly _destroy$ = new Subject<void>();

  templateForm: FormGroup;
  programs: IProgramsSlotCreate[] = [];
  templates = signal<ISlotTemplateResponse[]>([]);
  upcomingInstances = signal<ISlotInstancePublic[]>([]);
  pastInstances = signal<ISlotInstancePublic[]>([]);
  editingTemplate = signal<ISlotTemplateResponse | null>(null);
  instanceTab = signal<'upcoming' | 'past' | 'cancelled'>('upcoming');
  instanceSearch = signal('');
  statusFilter = signal<InstanceStatusFilter>('ALL');
  dateFromFilter = signal<string | null>(null);
  dateToFilter = signal<string | null>(null);

  upcomingPagination = signal<ISlotInstancePaginationMeta | null>(null);
  pastPagination = signal<ISlotInstancePaginationMeta | null>(null);
  upcomingPage = signal(1);
  pastPage = signal(1);
  isInstancesLoading = signal(false);

  upcomingActiveInstances = computed(() =>
    this.upcomingInstances().filter((instance) => instance.status !== 'CANCELLED')
  );

  pastActiveInstances = computed(() =>
    this.pastInstances().filter((instance) => instance.status !== 'CANCELLED')
  );

  cancelledInstances = computed(() => {
    const combined = [...this.upcomingInstances(), ...this.pastInstances()];
    return combined
      .filter((instance) => instance.status === 'CANCELLED')
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  });

  private readonly INSTANCES_PAGE_SIZE = 6;
  private filterReloadHandle: any = null;

  readonly recurrenceOptions: RecurrenceType[] = ['WEEKLY', 'DAILY'];
  readonly timezoneOptions = [
    'UTC',
    'Europe/London',
    'Europe/Berlin',
    'Asia/Kolkata',
    'Asia/Singapore',
    'America/New_York',
    'America/Los_Angeles',
  ];

  timeOptions: TimeOption[] = [];
  filteredEndOptions: TimeOption[] = [];

  weekDays: IDay[] = [
    { name: 'Mon', value: 'Mon', selected: false },
    { name: 'Tue', value: 'Tue', selected: false },
    { name: 'Wed', value: 'Wed', selected: false },
    { name: 'Thu', value: 'Thu', selected: false },
    { name: 'Fri', value: 'Fri', selected: false },
    { name: 'Sat', value: 'Sat', selected: false },
    { name: 'Sun', value: 'Sun', selected: false },
  ];

  constructor(private readonly _fb: FormBuilder) {
    this.generateTimeOptions();
    this.filteredEndOptions = [...this.timeOptions];

    const defaultTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';

    this.templateForm = this._fb.group(
      {
        programId: ['', Validators.required],
        recurrenceType: ['WEEKLY', Validators.required],
        intervalDays: [1, [Validators.min(1), Validators.max(30)]],
        startTime: ['', Validators.required],
        endTime: ['', Validators.required],
        capacity: [
          10,
          [Validators.required, Validators.min(1), Validators.max(100)],
        ],
        timezone: [defaultTimezone, Validators.required],
        isActive: [true],
      },
      {
        validators: [this.endTimeAfterStartTime()],
      }
    );

    this.templateForm
      .get('startTime')
      ?.valueChanges.pipe(takeUntil(this._destroy$))
      .subscribe((value: string) => this.updateEndOptions(value));
  }

  setInstanceTab(tab: 'upcoming' | 'past' | 'cancelled'): void {
    this.instanceTab.set(tab);
  }

  setInstanceSearch(term: string): void {
    this.instanceSearch.set(term);
    this.resetPagination();
    this.scheduleInstanceReload();
  }

  setStatusFilter(filter: InstanceStatusFilter | string): void {
    const allowed: InstanceStatusFilter[] = ['ALL', 'OPEN', 'CLOSED', 'CANCELLED'];
    const normalized = allowed.includes(filter as InstanceStatusFilter)
      ? (filter as InstanceStatusFilter)
      : 'ALL';
    this.statusFilter.set(normalized);
    this.resetPagination();
    this.scheduleInstanceReload();
  }

  setDateFilter(type: 'from' | 'to', value: string | null): void {
    const cleanedValue = value && value.trim().length ? value : null;
    if (type === 'from') {
      this.dateFromFilter.set(cleanedValue);
    } else {
      this.dateToFilter.set(cleanedValue);
    }
    this.resetPagination();
    this.scheduleInstanceReload();
  }

  clearInstanceFilters(): void {
    this.instanceSearch.set('');
    this.statusFilter.set('ALL');
    this.dateFromFilter.set(null);
    this.dateToFilter.set(null);
    this.resetPagination();
    this.loadTrainerInstances();
  }

  ngOnInit(): void {
    this.loadPrograms();
    this.loadTemplates();
    this.loadTrainerInstances();
  }

  private loadPrograms(): void {
    this._programService
      .getProgramsForSlotCreate()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (programs) => (this.programs = programs),
        error: (err) => this._loggerService.error('Programs fetch failed', err),
      });
  }

  private loadTemplates(): void {
    this._slotService
      .getTemplates()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (templates) => this.templates.set(templates),
        error: (err) => {
          this._toastService.error('Failed to load slot templates');
          this._loggerService.error(err);
        },
      });
  }

  private loadTrainerInstances(): void {
    this.isInstancesLoading.set(true);
    forkJoin({
      upcoming: this._slotService.getTrainerInstances(
        this.buildTrainerFilterPayload('upcoming')
      ),
      past: this._slotService.getTrainerInstances(
        this.buildTrainerFilterPayload('past')
      ),
    })
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: ({ upcoming, past }) => {
          this.upcomingInstances.set(upcoming.data ?? []);
          this.pastInstances.set(past.data ?? []);
          this.upcomingPagination.set(upcoming.pagination);
          this.pastPagination.set(past.pagination);
          this.isInstancesLoading.set(false);
        },
        error: (err) => {
          this._loggerService.warn('Unable to fetch trainer instances', err);
          this._toastService.error('Failed to load slot instances');
          this.isInstancesLoading.set(false);
        },
      });
  }

  private buildTrainerFilterPayload(segment: 'upcoming' | 'past') {
    const status = this.statusFilter();
    const base = {
      segment,
      from: this.dateFromFilter() ?? undefined,
      to: this.dateToFilter() ?? undefined,
      status: status === 'ALL' ? undefined : status,
      search: this.instanceSearch().trim().length
        ? this.instanceSearch().trim()
        : undefined,
      limit: this.INSTANCES_PAGE_SIZE,
      page: segment === 'upcoming' ? this.upcomingPage() : this.pastPage(),
    };
    return base;
  }

  private resetPagination(): void {
    this.upcomingPage.set(1);
    this.pastPage.set(1);
  }

  private scheduleInstanceReload(): void {
    if (this.filterReloadHandle) {
      clearTimeout(this.filterReloadHandle);
    }
    this.filterReloadHandle = setTimeout(() => {
      this.filterReloadHandle = null;
      this.loadTrainerInstances();
    }, 300);
  }

  changePage(segment: 'upcoming' | 'past', direction: 'prev' | 'next'): void {
    const pagination = segment === 'upcoming' ? this.upcomingPagination() : this.pastPagination();
    if (!pagination) return;

    if (direction === 'prev' && pagination.page > 1) {
      if (segment === 'upcoming') {
        this.upcomingPage.set(pagination.page - 1);
      } else {
        this.pastPage.set(pagination.page - 1);
      }
      this.loadTrainerInstances();
    }

    if (direction === 'next' && pagination.hasNextPage) {
      if (segment === 'upcoming') {
        this.upcomingPage.set(pagination.page + 1);
      } else {
        this.pastPage.set(pagination.page + 1);
      }
      this.loadTrainerInstances();
    }
  }

  submitTemplate(): void {
    if (this.templateForm.invalid) {
      this._toastService.error('Please fix the highlighted errors');
      return;
    }

    const recurrenceType = this.templateForm.value
      .recurrenceType as RecurrenceType;
    const selectedDays = this.getSelectedDays();

    if (recurrenceType === 'WEEKLY' && selectedDays.length === 0) {
      this._toastService.error('Select at least one day for weekly recurrence');
      return;
    }

    const payload = this.buildPayload(recurrenceType, selectedDays);
    const editing = this.editingTemplate();

    if (editing) {
      this._slotService
        .updateTemplate(editing._id, payload)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (updated) => {
            this.templates.update((current) =>
              current.map((tmpl) => (tmpl._id === updated._id ? updated : tmpl))
            );
            this._toastService.success('Template updated');
            this.resetForm();
          },
          error: (err) => {
            this._toastService.error('Failed to update template');
            this._loggerService.error(err);
          },
        });
    } else {
      this._slotService
        .createTemplate(payload as ICreateSlotTemplatePayload)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (created) => {
            this.templates.update((current) => [created, ...current]);
            this._toastService.success('Template created');
            this.resetForm();
          },
          error: (err) => {
            this._toastService.error('Failed to create template');
            this._loggerService.error(err);
          },
        });
    }
  }

  private buildPayload(
    recurrenceType: RecurrenceType,
    days: string[]
  ): ICreateSlotTemplatePayload | Partial<ICreateSlotTemplatePayload> {
    const recurrence: SlotRecurrence = { type: recurrenceType };

    if (recurrenceType === 'WEEKLY') {
      recurrence.daysOfWeek = days;
    } else if (recurrenceType === 'DAILY') {
      recurrence.intervalDays = this.templateForm.value.intervalDays ?? 1;
    }

    return {
      programId: this.templateForm.value.programId!,
      startTime: this.templateForm.value.startTime!,
      endTime: this.templateForm.value.endTime!,
      capacity: this.templateForm.value.capacity!,
      timezone: this.templateForm.value.timezone!,
      isActive: this.templateForm.value.isActive ?? true,
      recurrence,
    };
  }

  startEdit(template: ISlotTemplateResponse): void {
    this.editingTemplate.set(template);
    this.templateForm.patchValue({
      programId: template.programId,
      recurrenceType: template.recurrence.type,
      intervalDays: template.recurrence.intervalDays ?? 1,
      startTime: template.startTime,
      endTime: template.endTime,
      capacity: template.capacity,
      timezone: template.timezone,
      isActive: template.isActive,
    });
    this.updateEndOptions(template.startTime);
    this.applyDaySelection(
      template.recurrence.daysOfWeek ?? this.getSelectedDays()
    );
  }

  cancelEdit(): void {
    this.editingTemplate.set(null);
    this.resetForm();
  }

  regenerateInstances(templateId: string): void {
    const template = this.templates().find((tmpl) => tmpl._id === templateId);
    const programName = template
      ? this.getProgramDetails(template.programId)?.title ?? 'this template'
      : 'this template';

    Swal.fire({
      title: 'Generate 2 weeks of slots?',
      text: `This will recreate upcoming sessions for ${programName}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Generate',
      cancelButtonText: 'Not now',
      focusCancel: true,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this._slotService
        .generateInstancesForTemplate(templateId, 14)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: () => {
            this._toastService.success('Generated upcoming instances');
            this.loadTrainerInstances();
          },
          error: (err) => {
            this._toastService.error('Failed to generate instances');
            this._loggerService.error(err);
          },
        });
    });
  }

  deleteTemplate(template: ISlotTemplateResponse): void {
    const programTitle =
      this.getProgramDetails(template.programId)?.title ?? 'this program';

    Swal.fire({
      title: 'Delete this template?',
      text: `Slots tied to ${programTitle} will stop generating automatically.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      focusCancel: true,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this._slotService
        .deleteTemplate(template._id)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: () => {
            this.templates.update((current) =>
              current.filter((tmpl) => tmpl._id !== template._id)
            );
            this._toastService.success('Template deleted');
            if (this.editingTemplate()?._id === template._id) {
              this.cancelEdit();
            }
            this.loadTrainerInstances();
          },
          error: (err) => {
            this._toastService.error('Failed to delete template');
            this._loggerService.error(err);
          },
        });
    });
  }

  cancelSlotInstance(instance: ISlotInstancePublic): void {
    if (instance.status === 'CANCELLED') {
      return;
    }

    Swal.fire({
      title: 'Cancel this slot?',
      text: 'Booked users will be notified',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#111827',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'Keep slot',
      focusCancel: true,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this._slotService
        .cancelSlotInstance(instance._id)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: () => {
            this.loadTrainerInstances();
            this._toastService.success('Slot cancelled');
          },
          error: (err) => {
            this._toastService.error('Failed to cancel slot');
            this._loggerService.error(err);
          },
        });
    });
  }

  toggleDay(day: IDay): void {
    day.selected = !day.selected;
  }

  getSelectedDays(): string[] {
    return this.weekDays.filter((day) => day.selected).map((day) => day.value);
  }

  private applyDaySelection(days: string[]): void {
    this.weekDays.forEach((day) => {
      day.selected = days.includes(day.value);
    });
  }

  resetForm(): void {
    this.templateForm.reset({
      recurrenceType: 'WEEKLY',
      intervalDays: 1,
      capacity: 10,
      timezone: this.templateForm.value.timezone,
      isActive: true,
    });
    this.updateEndOptions('');
    this.weekDays.forEach((day) => (day.selected = false));
    this.editingTemplate.set(null);
  }

  private generateTimeOptions(): void {
    const times: TimeOption[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const value = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        times.push({
          value,
          display: this.formatTime12Hour(hour, minute),
          minutes: hour * 60 + minute,
        });
      }
    }
    this.timeOptions = times;
  }

  formatTime12Hour(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  formatTimeDisplay(value: string): string {
    const [hourStr, minuteStr] = value.split(':');
    return this.formatTime12Hour(Number(hourStr), Number(minuteStr));
  }

  private updateEndOptions(startTime: string): void {
    if (!startTime) {
      this.filteredEndOptions = [...this.timeOptions];
      return;
    }
    const startMinutes = this.timeOptions.find((t) => t.value === startTime)?.minutes ?? 0;
    this.filteredEndOptions = this.timeOptions.filter(
      (opt) => opt.minutes > startMinutes
    );

    if (this.templateForm.value.endTime) {
      const endMinutes =
        this.timeOptions.find((t) => t.value === this.templateForm.value.endTime)
          ?.minutes ?? 0;
      if (endMinutes <= startMinutes) {
        this.templateForm.patchValue({ endTime: '' });
      }
    }
  }

  endTimeAfterStartTime() {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('startTime')?.value;
      const end = group.get('endTime')?.value;
      if (!start || !end) return null;
      const startMinutes =
        this.timeOptions.find((t) => t.value === start)?.minutes ?? 0;
      const endMinutes =
        this.timeOptions.find((t) => t.value === end)?.minutes ?? 0;
      return endMinutes <= startMinutes ? { endBeforeStart: true } : null;
    };
  }

  getProgramDetails(programId: string): IProgramsSlotCreate | undefined {
    return this.programs.find((p) => p.id === programId);
  }

  formatRecurrence(template: ISlotTemplateResponse): string {
    if (template.recurrence.type === 'WEEKLY') {
      return `Weekly on ${(template.recurrence.daysOfWeek || []).join(', ')}`;
    }
    if (template.recurrence.type === 'DAILY') {
      return `Every ${template.recurrence.intervalDays ?? 1} day(s)`;
    }
    return 'Custom pattern';
  }

  trackByTemplate(_: number, template: ISlotTemplateResponse): string {
    return template._id;
  }

  trackByInstance(_: number, instance: ISlotInstancePublic): string {
    return instance._id;
  }

  ngOnDestroy(): void {
    if (this.filterReloadHandle) {
      clearTimeout(this.filterReloadHandle);
    }
    this._destroy$.next();
    this._destroy$.complete();
  }
}
