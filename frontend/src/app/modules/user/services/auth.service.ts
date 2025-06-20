import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class authService {
  private apiUri = 'http://localhost:3000/api/signup';
  constructor(private http: HttpClient) {}
  signupUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUri, userData);
  }
}
