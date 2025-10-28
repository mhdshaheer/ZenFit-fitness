import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Program,
  ProgramCategory,
} from '../../features/trainer/store/trainer.model';
import { Observable } from 'rxjs';
import { ProgramRoutes } from '../constants/api-routes.const';
import { IProgramsSlotCreate } from '../../interface/program.interface';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  private readonly _apiUrl = environment.apiUrl + ProgramRoutes.BASE;
  private readonly _http = inject(HttpClient);

  saveProgram(data: Program) {
    return this._http.post<{ message: string }>(`${this._apiUrl}`, data);
  }
  getAllPrograms(): Observable<Program[]> {
    return this._http.get<Program[]>(`${this._apiUrl}`);
  }
  getProgramByProgramId(programId: string) {
    return this._http.get<Program>(`${this._apiUrl}/${programId}`);
  }

  updateProgram(programId: string, program: Program) {
    return this._http.put<{ message: string }>(
      `${this._apiUrl}/${programId}`,
      program
    );
  }
  saveProgramDraft(data: Program) {
    return this._http.post<{ message: string }>(
      `${this._apiUrl}${ProgramRoutes.DRAFT}`,
      data
    );
  }

  getProgramsForSlotCreate(): Observable<IProgramsSlotCreate[]> {
    return this._http.get<IProgramsSlotCreate[]>(
      `${this._apiUrl}/create-slots`
    );
  }
  getPrograms(): Observable<{ programs: Program[] }> {
    return this._http.get<{ programs: Program[] }>(
      `${this._apiUrl}${ProgramRoutes.TRAINER}`
    );
  }
  getProgramCategory() {
    return this._http.get<{ programs: ProgramCategory[] }>(
      `${this._apiUrl}${ProgramRoutes.CATEGORY}`
    );
  }
  getProgramsByParantId(
    categoryId: string
  ): Observable<{ programs: Program[] }> {
    return this._http.get<{ programs: Program[] }>(
      `${this._apiUrl}${ProgramRoutes.CATEGORY_BY_ID(categoryId)}`
    );
  }

  updateApprovalStatus(
    programId: string,
    approvalStatus: string
  ): Observable<Program> {
    return this._http.put<Program>(
      `${this._apiUrl}${ProgramRoutes.APPROVAL_STATUS(programId)}`,
      { approvalStatus }
    );
  }
}
