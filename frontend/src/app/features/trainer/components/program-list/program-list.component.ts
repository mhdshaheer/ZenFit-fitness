import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { Router } from '@angular/router';
import { ProgramCardComponent } from '../../../../shared/components/program-card/program-card.component';
import { firstValueFrom, forkJoin, Subject } from 'rxjs';
import { PaymentService } from '../../../../core/services/payment.service';
import { LoggerService } from '../../../../core/services/logger.service';

export interface FitnessProgram {
  id?: string;
  _id?: string;
  title: string;
  duration: string;
  category: string;
  description: string;
  image?: string;
  difficultyLevel: string;
  enrolledCount?: number;
  rating?: number;
  price: number;
  status?: string;
}

@Component({
  selector: 'app-program-list',
  imports: [ProgramCardComponent],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnInit, OnDestroy {
  private _programService = inject(ProgramService);
  private _paymentService = inject(PaymentService);
  private _router = inject(Router);
  private _logger = inject(LoggerService);

  fitnessPrograms: FitnessProgram[] = [];
  defaultImage = '/trainer/fitness_program.jpg';
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.getPrograms();
  }

  async getPrograms(): Promise<void> {
    try {
      const res = await firstValueFrom(this._programService.getPrograms());
      this._logger.info('Programs response:', res);
      const programObservables = res.programs.map((item) => {
        return this._paymentService.getEntrolledUsers(item.id!);
      });
      const counts = await firstValueFrom(forkJoin(programObservables));
      this.fitnessPrograms = res.programs.map((item, index) => {
        const category = JSON.parse(item.category).name;
        return {
          ...item,
          category: category,
          enrolledCount: counts[index].count,
        };
      });
    } catch (err) {
      this._logger.error('Error fetching programs or enrolled counts:', err);
      this.fitnessPrograms = [];
    }
  }

  onViewProgram(programId: string): void {
    console.log('Viewing program with ID:', programId);
    this._router.navigate(['/trainer/program', programId]);
  }

  onProgramSlot(programId: string): void {
    console.log('Program ID:', programId);
    this._router.navigate(['/trainer/purchased-users', programId]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
