import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TrainerRoutes } from '../constants/api-routes.const';
import { TrainerDashboardSnapshot } from '../../interface/trainer-dashboard.interface';

export interface TrainerDashboardResponse {
    success: boolean;
    data: TrainerDashboardSnapshot;
}

@Injectable({ providedIn: 'root' })
export class TrainerDashboardService {
    private readonly _http = inject(HttpClient);
    private readonly _baseUrl = environment.apiUrl + TrainerRoutes.BASE;

    getSnapshot(): Observable<TrainerDashboardResponse> {
        return this._http.get<TrainerDashboardResponse>(
            `${this._baseUrl}${TrainerRoutes.DASHBOARD_SNAPSHOT}`,
        );
    }
}
