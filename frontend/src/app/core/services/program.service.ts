import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Program,
  ProgramCategory,
} from '../../features/trainer/store/trainer.model';
import { Observable } from 'rxjs';
import { ProgramRoutes } from '../constants/api-routes.const';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  apiUrl = environment.apiUrl + ProgramRoutes.BASE;
  http = inject(HttpClient);

  saveProgram(data: Program) {
    return this.http.post<{ message: string }>(`${this.apiUrl}`, data);
  }
  getAllPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}`);
  }
  getProgramByProgramId(programId: string) {
    return this.http.get<Program>(`${this.apiUrl}/${programId}`);
  }

  updateProgram(programId: string, program: Program) {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/${programId}`,
      program
    );
  }
  saveProgramDraft(data: Program) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}${ProgramRoutes.DRAFT}`,
      data
    );
  }

  getPrograms(): Observable<{ programs: Program[] }> {
    return this.http.get<{ programs: Program[] }>(
      `${this.apiUrl}${ProgramRoutes.TRAINER}`
    );
  }
  getProgramCategory() {
    return this.http.get<{ programs: ProgramCategory[] }>(
      `${this.apiUrl}${ProgramRoutes.CATEGORY}`
    );
  }
  getProgramsByParantId(
    categoryId: string
  ): Observable<{ programs: Program[] }> {
    return this.http.get<{ programs: Program[] }>(
      `${this.apiUrl}${ProgramRoutes.CATEGORY_BY_ID(categoryId)}`
    );
  }

  updateApprovalStatus(
    programId: string,
    approvalStatus: string
  ): Observable<Program> {
    return this.http.put<Program>(
      `${this.apiUrl}${ProgramRoutes.APPROVAL_STATUS(programId)}`,
      { approvalStatus }
    );
  }
}
