import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Program,
  ProgramCategory,
} from '../../features/trainer/store/trainer.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProgramService {
  apiUrl = environment.apiUrl;
  http = inject(HttpClient);

  saveProgramDraft(data: Program) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/program/draft`,
      data
    );
  }
  saveProgram(data: Program) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/program`, data);
  }
  getAllPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/program`);
  }

  getPrograms(): Observable<{ programs: Program[] }> {
    return this.http.get<{ programs: Program[] }>(`${this.apiUrl}/program`);
  }
  getProgramCategory() {
    return this.http.get<{ programs: ProgramCategory[] }>(
      `${this.apiUrl}/program/category`
    );
  }
  getProgramsByParantId(
    categoryId: string
  ): Observable<{ programs: Program[] }> {
    return this.http.get<{ programs: Program[] }>(
      `${this.apiUrl}/program/category/${categoryId}`
    );
  }

  getProgramByProgramId(programId: string) {
    return this.http.get<Program>(`${this.apiUrl}/program/${programId}`);
  }

  updateProgram(programId: string, program: Program) {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/program/${programId}`,
      program
    );
  }

  updateApprovalStatus(
    programId: string,
    approvalStatus: string
  ): Observable<Program> {
    return this.http.put<Program>(
      `${this.apiUrl}/program/approvalStatus/${programId}`,
      { approvalStatus }
    );
  }
}
