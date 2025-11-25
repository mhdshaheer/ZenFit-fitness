import { Component, inject, OnInit } from '@angular/core';
import { ProgramService } from '../../../../core/services/program.service';
import { LoggerService } from '../../../../core/services/logger.service';
import {
  TableAction,
  TableColumn,
} from '../../../../interface/shared.interface';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { IProgramTable } from '../../../../interface/program.interface';
import { Program } from '../../../trainer/store/trainer.model';
import { ApprovalStatusColorPipe } from '../../../../shared/pipes/approval-status-color.pipe';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ActionEvent } from '../user-manage/user-manage.component';

type ApprovalTabValue = 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'zenfit-program-list',
  imports: [TableComponent, ApprovalStatusColorPipe, NgClass],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnInit {
  private readonly _programService = inject(ProgramService);
  private readonly _logger = inject(LoggerService);
  private readonly _router = inject(Router);
  private _allPrograms: IProgramTable[] = [];

  programsColumn: TableColumn[] = [
    { key: 'name', label: 'Program Name', sortable: true, width: '200px' },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      width: '150px',
      type: 'approval',
    },
    { key: 'price', label: 'Price', width: '150px' },
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
      width: '150px',
    },
  ];
  programs: IProgramTable[] = [];
  programCounts: Record<ApprovalTabValue, number> = {
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  };
  isLoading = false;

  approvalTabs: { label: string; value: ApprovalTabValue; helper: string }[] = [
    { label: 'Pending', value: 'Pending', helper: 'Awaiting review' },
    { label: 'Approved', value: 'Approved', helper: 'Live programs' },
    { label: 'Rejected', value: 'Rejected', helper: 'Needs updates' },
  ];

  tabStyles: Record<ApprovalTabValue, { active: string; inactive: string }> = {
    Pending: {
      active:
        'bg-yellow-500 border-yellow-500 text-white shadow-sm hover:bg-yellow-500',
      inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
    },
    Approved: {
      active:
        'bg-green-600 border-green-600 text-white shadow-sm hover:bg-green-600',
      inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
    },
    Rejected: {
      active:
        'bg-red-600 border-red-600 text-white shadow-sm hover:bg-red-600',
      inactive: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50',
    },
  };

  activeApprovalTab: ApprovalTabValue = 'Pending';

  programAction: TableAction[] = [
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

  getTabButtonClasses(tabValue: ApprovalTabValue): string {
    const baseClasses =
      'w-full text-left border rounded-lg px-4 py-3 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    const styles = this.tabStyles[tabValue];
    const isActive = this.activeApprovalTab === tabValue;

    return isActive
      ? `${baseClasses} ${styles.active}`
      : `${baseClasses} ${styles.inactive}`;
  }

  getTabHelperClasses(tabValue: ApprovalTabValue): string {
    const isActive = this.activeApprovalTab === tabValue;
    if (isActive) {
      return 'text-sm text-white/80';
    }
    return 'text-sm text-gray-500';
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

  onViewProgram(event: ActionEvent) {
    if (event.action == 'view') {
      this._logger.info('view action is clicked :', event.row.id);
      this._router.navigate(['admin/programs', event.row.id]);
    }
  }
}
