import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProgramService } from '../../../../core/services/program.service';
import { FitnessProgram } from '../../../trainer/components/program-list/program-list.component';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'zenfit-program-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './program-view.component.html',
  styleUrl: './program-view.component.css'
})
export class ProgramViewComponent implements OnInit, OnDestroy {
  readonly _route = inject(ActivatedRoute);
  readonly _router = inject(Router);
  private readonly _programService = inject(ProgramService);
  private readonly _logger = inject(LoggerService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _destroy$ = new Subject<void>();

  programId = '';
  program: FitnessProgram | null = null;
  isLoading = true;

  ngOnInit(): void {
    this._route.paramMap
      .pipe(takeUntil(this._destroy$))
      .subscribe((paramMap) => {
        const id = paramMap.get('id');
        this._logger.info('Program View Page Load ID:', id);
        if (id) {
          this.programId = id;
          this.loadProgram(id);
        } else {
          this.isLoading = false;
          this._cdr.detectChanges();
        }
      });
  }

  loadProgram(id: string): void {
    this.isLoading = true;
    this._programService.getProgramByProgramId(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (data: any) => {
          let subCatName = 'Uncategorized';
          try {
            if (data.category) {
              const catObj = typeof data.category === 'string' ? JSON.parse(data.category) : data.category;
              subCatName = (catObj.name || 'Uncategorized').trim();
            }
          } catch (e) {
            this._logger.warn('Non-JSON category for program:', data.title);
            if (typeof data.category === 'string') subCatName = data.category;
          }
          this.program = {
            ...data,
            category: subCatName
          } as unknown as FitnessProgram;
          this.isLoading = false;
          this._cdr.detectChanges();
        },
        error: (err) => {
          this._logger.error('Error fetching program details:', err);
          this.isLoading = false;
          this._cdr.detectChanges();
        }
      });
  }

  onPurchase(): void {
    if (this.programId) {
      this._router.navigate(['/user/payment', this.programId]);
    }
  }

  getDifficultyColor(level: string): string {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'advanced':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
