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
    return this._http.get<Program[]>(`${this._apiUrl}`, { withCredentials: true });
  }
  getProgramByProgramId(programId: string) {
    return this._http.get<Program>(`${this._apiUrl}/${programId}`, { withCredentials: true });
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
      `${this._apiUrl}/create-slots`,
      { withCredentials: true }
    );
  }
  getPrograms(): Observable<{ programs: Program[] }> {
    return this._http.get<{ programs: Program[] }>(
      `${this._apiUrl}${ProgramRoutes.TRAINER}`
    );
  }
  getProgramCategory() {
    return this._http.get<{ programs: ProgramCategory[] }>(
      `${this._apiUrl}${ProgramRoutes.CATEGORY}`,
      { withCredentials: true }
    );
  }
  getProgramsByParantId(
    categoryId: string,
    params?: any
  ): Observable<{ programs: Program[] }> {
    return this._http.get<{ programs: Program[] }>(
      `${this._apiUrl}${ProgramRoutes.CATEGORY_BY_ID(categoryId)}`,
      { withCredentials: true, params }
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

  getTrainerPrograms(filters: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    difficultyLevel?: string;
    status?: string;
    approvalStatus?: string;
  }): Observable<{
    programs: Program[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.category) params.append('category', filters.category);
    if (filters.difficultyLevel) params.append('difficultyLevel', filters.difficultyLevel);
    if (filters.status) params.append('status', filters.status);
    if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);

    return this._http.get<{
      programs: Program[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(`${this._apiUrl}${ProgramRoutes.TRAINER}?${params.toString()}`);
  }
}
