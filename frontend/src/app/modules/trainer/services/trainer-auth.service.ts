import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TrainerAuthService {
  private api = 'http://localhost:5001/trainer';
  constructor(private http: HttpClient) {}
  sendOtp(trainerData: any): Observable<any> {
    return this.http.post<any>(`${this.api}/send-otp`, trainerData);
  }
  verifyOtp(data: { email: string; otp: string }): Observable<any> {
    return this.http.post(`${this.api}/verify-otp`, data);
  }
}
