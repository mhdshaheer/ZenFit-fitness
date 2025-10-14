import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile.service';
import { Subject, takeUntil } from 'rxjs';

interface Program {
  programName: string;
  trainerId?: string;
  description: string;
  price: number;
  createdDate: string;
  difficultyLevel: string;
  duration: string;
}

interface Trainer {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}
@Component({
  selector: 'zenfit-program-view',
  imports: [CommonModule],
  templateUrl: './program-view.component.html',
  styleUrl: './program-view.component.css',
})
export class ProgramViewComponent implements OnInit, OnDestroy {
  private _programService = inject(ProgramService);
  private _profileService = inject(ProfileService);
  private _logger = inject(LoggerService);
  private _activatedRoute = inject(ActivatedRoute);
  private _destroy$ = new Subject<void>();

  programId!: string;
  program!: Program;
  trainerId!: string;
  trainer!: Trainer;

  getDifficultyClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  ngOnInit() {
    this.programId = this._activatedRoute.snapshot.paramMap.get('programId')!;
    this.getProgram(this.programId);
  }
  getProgram(programId: string) {
    this._programService
      .getProgramByProgramId(programId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._logger.info('program is :', res);
          this.program = {
            programName: res.title,
            description: res.description,
            difficultyLevel: res.difficultyLevel,
            duration: res.duration,
            price: res.price,
            createdDate: res.createdAt!,
          };
          this.trainerId = res.trainerId;
          this.getTrainer(this.trainerId);
        },
        error: (err) => {
          this._logger.error('Failed to fetch programs :', err);
        },
      });
  }
  getTrainer(trainerId: string) {
    this._profileService
      .getUserById(trainerId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (res) => {
          this._logger.info('Trainer details :', res);
          this.trainer = {
            name: res.fullName,
            email: res.email,
            phone: res.phone!,
          };
          this.getProfileImage(res.profileImage, this.trainerId);
        },
        error: (err) => {
          this._logger.error('Failed to fetch trainer info :', err);
        },
      });
  }

  getProfileImage(profileUrl: string, trainerId: string) {
    this._profileService.getFile(profileUrl, trainerId).subscribe({
      next: (res) => {
        this.trainer.avatar = res.url;
      },
    });
  }

  approveProgram(): void {
    console.log('Program approved:', this.program);
    alert(`Program "${this.program.programName}" has been approved!`);
  }

  rejectProgram(): void {
    console.log('Program rejected:', this.program);
    alert(`Program "${this.program.programName}" has been rejected.`);
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
