import { Component, inject, OnInit } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { ActionEvent, TableAction, TableColumn } from '../../../../interface/shared.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { SharedSkeletonComponent } from '../../../../shared/components/shared-skeleton/shared-skeleton.component';
import { IProgramTable } from '../../../../interface/program.interface';
import { Program } from '../../../trainer/store/trainer.model';
import { ApprovalStatusColorPipe } from '../../../../shared/pipes/approval-status-color.pipe';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type ApprovalTabValue = 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'zenfit-program-list',
  imports: [TableComponent, ApprovalStatusColorPipe, CommonModule, SharedSkeletonComponent],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnInit {
  private readonly _programService = inject(ProgramService);
  private readonly _logger = inject(LoggerService);
  private readonly _router = inject(Router);
  private _allPrograms: IProgramTable[] = [];

  programsColumn: TableColumn[] = [
    { key: 'name', label: 'Program Name', sortable: true },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      width: '180px',
      type: 'approval',
    },
    { key: 'price', label: 'Price', width: '120px' },
    {
      key: 'status',
      label: 'Status',
      type: 'status',
      sortable: true,
      width: '120px',
    },
    {
      key: 'createdAt',
      label: 'Created At',
      type: 'date',
      sortable: true,
      width: '160px',
    },
  ];
  programs: IProgramTable[] = [];
  programCounts: Record<ApprovalTabValue, number> = {
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  };
  isLoading = false;

  approvalTabs: { label: string; value: ApprovalTabValue; helper: string; icon: string }[] = [
    { label: 'Pending', value: 'Pending', helper: 'Review Queue', icon: 'fas fa-clock' },
    { label: 'Approved', value: 'Approved', helper: 'Live Inventory', icon: 'fas fa-check-circle' },
    { label: 'Rejected', value: 'Rejected', helper: 'Correction List', icon: 'fas fa-exclamation-triangle' },
  ];

  activeApprovalTab: ApprovalTabValue = 'Pending';

  programAction: TableAction<IProgramTable>[] = [
    { label: 'View', icon: 'view', color: 'blue', action: 'view' },
  ];

  ngOnInit() {
    this.getAllPrograms();
  }

  getAllPrograms() {
    this.isLoading = true;
    this._programService.getAllPrograms().subscribe({
      next: (res: Program[]) => {
        this._logger.info('All program are :', res);
        this._allPrograms = res.map((item) => {
          return {
            _id: item._id,
            id: item.id,
            description: item.description,
            name: item.title,
            price: item.price,
            createdAt: item.createdAt,
            isBlocked: item.status == 'active' ? false : true,
            status: item.status == 'inactive' ? 'blocked' : 'active',
            approvalStatus: item.approvalStatus,
          };
        });
        this.updateProgramCounts();
        this.applyApprovalFilter();
      },
      error: (err) => {
        this._logger.error('Failed to fetch programs :', err);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  setApprovalTab(tabValue: ApprovalTabValue) {
    if (this.activeApprovalTab === tabValue) {
      return;
    }
    this.activeApprovalTab = tabValue;
    this.applyApprovalFilter();
  }


  private applyApprovalFilter() {
    this.programs = this._allPrograms.filter(
      (program) => this.normalizeApprovalStatus(program.approvalStatus) === this.activeApprovalTab
    );
  }

  private updateProgramCounts() {
    this.programCounts = {
      Pending: 0,
      Approved: 0,
      Rejected: 0,
    };

    this._allPrograms.forEach((program) => {
      const status = this.normalizeApprovalStatus(program.approvalStatus);
      this.programCounts[status] += 1;
    });
  }

  private normalizeApprovalStatus(
    status: IProgramTable['approvalStatus']
  ): ApprovalTabValue {
    if (status === 'Approved' || status === 'Rejected') {
      return status;
    }
    return 'Pending';
  }

  onViewProgram(event: ActionEvent<IProgramTable>) {
    if (event.action == 'view') {
      this._logger.info('view action is clicked :', event.row.id);
      this._router.navigate(['admin/programs', event.row.id]);
    }
  }
}
