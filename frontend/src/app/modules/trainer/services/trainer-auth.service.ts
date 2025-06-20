import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TrainerAuthService {
  private api = 'http://localhost:5001/trainer/signup';
  constructor(private http: HttpClient) {}
  signupTrainer(trainerData: any): Observable<any> {
    return this.http.post<any>(this.api, trainerData);
  }
}
