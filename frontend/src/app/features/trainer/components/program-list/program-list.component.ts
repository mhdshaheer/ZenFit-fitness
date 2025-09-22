import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { Router } from '@angular/router';
import { ProgramCardComponent } from '../../../../shared/components/program-card/program-card.component';

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
export class ProgramListComponent {
  programService = inject(ProgramService);
  fitnessPrograms: FitnessProgram[] = [];
  defaultImage: string = '/trainer/fitness_program.jpg';
  router = inject(Router);

  getPrograms(): void {
    this.programService.getPrograms().subscribe({
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

  ngOnInit() {
    this.getPrograms();
  }

  onViewProgram(programId: string): void {
    console.log('Viewing program with ID:', programId);
  }

  onProgramSlot(programId: string): void {
    console.log('Program ID:', programId);
    this.router.navigate(['/trainer/slot', programId]);
  }

  createProgram() {
    this.router.navigate([`/trainer/program-create`]);
  }

  createSlot() {
    this.router.navigate(['/trainer/slot-create']);
  }
}
