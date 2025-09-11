import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Program,
  ProgramCategory,
} from '../../features/trainer/store/trainer.model';

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

  getPrograms() {
    return this.http.get<{ programs: Program[] }>(`${this.apiUrl}/program`);
  }
  getProgramCategory() {
    return this.http.get<{ programs: ProgramCategory[] }>(
      `${this.apiUrl}/program/category`
    );
  }
}
