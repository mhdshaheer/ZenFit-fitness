import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

interface Program {
  programName: string;
  trainerId?: string;
  description: string;
  price: number;
  createdDate: string;
  difficultyLevel: string;
  duration: string;
  approvalStatus?: 'Pending' | 'Approved' | 'Rejected';
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
  private _dialog = inject(MatDialog);
  private _toastService = inject(ToastService);
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
            approvalStatus: res.approvalStatus,
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
    // setTimeout(() => {
    //   this._profileService.getFile(profileUrl, trainerId).subscribe({
    //     next: (res) => {
    //       this.trainer.avatar = res.url;
    //     },
    //   });
    // }, 2000);
  }

  approveProgram(): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Approve',
        message: `Are you sure you want to approve this program?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._programService
          .updateApprovalStatus(this.programId, 'Approved')
          .subscribe({
            next: (res) => {
              this._logger.info('Program Approved');
              this.program.approvalStatus = res.approvalStatus;
              this._toastService.success('Program Approved');
            },
            error: (err) => {
              this._logger.error('Failed to update approval status', err);
              this._toastService.error('Failed to Approved Program');
            },
          });
      }
    });
  }

  rejectProgram(): void {
    const dialogRef = this._dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Reject',
        message: `Are you sure you want to reject this program?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._programService
          .updateApprovalStatus(this.programId, 'Rejected')
          .subscribe({
            next: (res) => {
              this._logger.info('Program rejected');
              this.program.approvalStatus = res.approvalStatus;
              this._toastService.success('Program Rejected');
            },
            error: (err) => {
              this._logger.error('Failed to update approval status', err);
              this._toastService.error('Failed to Reject Program');
            },
          });
      }
    });
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
