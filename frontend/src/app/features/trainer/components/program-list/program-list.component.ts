import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { Router } from '@angular/router';
import { ProgramCardComponent } from '../../../../shared/components/program-card/program-card.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  imports: [CommonModule, ProgramCardComponent],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnInit, OnDestroy {
  private programService = inject(ProgramService);
  private router = inject(Router);

  fitnessPrograms: FitnessProgram[] = [];
  defaultImage: string = '/trainer/fitness_program.jpg';

  // Subject to manage unsubscription
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.getPrograms();
  }

  getPrograms(): void {
    this.programService
      .getPrograms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log('Programs response:', res);
          this.fitnessPrograms = res.programs.map((item) => {
            let category = JSON.parse(item.category).name;
            return { ...item, category: category };
          });
        },
        error: (err) => {
          console.error('Error fetching programs:', err);
          this.fitnessPrograms = [];
        },
      });
  }

  onViewProgram(programId: string): void {
    console.log('Viewing program with ID:', programId);
    this.router.navigate(['/trainer/program', programId]);
  }

  onProgramSlot(programId: string): void {
    console.log('Program ID:', programId);
    this.router.navigate(['/trainer/slot', programId]);
  }

  createProgram() {
    this.router.navigate([`/trainer/program-create`]);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
