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

@Component({
  selector: 'zenfit-program-list',
  imports: [TableComponent, ApprovalStatusColorPipe, NgClass],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',
})
export class ProgramListComponent implements OnInit {
  private _programService = inject(ProgramService);
  private _logger = inject(LoggerService);
  private _router = inject(Router);

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

  programAction: TableAction[] = [
    { label: 'View', icon: 'view', color: 'blue', action: 'view' },
  ];

  ngOnInit() {
    this.getAllPrograms();
  }
  getAllPrograms() {
    this._programService.getAllPrograms().subscribe({
      next: (res: Program[]) => {
        this._logger.info('All program are :', res);
        this.programs = res.map((item) => {
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
      },
      error: (err) => {
        this._logger.error('Failed to fetch programs :', err);
      },
    });
  }
  onViewProgram(event: ActionEvent) {
    if (event.action == 'view') {
      this._logger.info('view action is clicked :', event.row.id);
      this._router.navigate(['admin/programs', event.row.id]);
    }
  }
}
