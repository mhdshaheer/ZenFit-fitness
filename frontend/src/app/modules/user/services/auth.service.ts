import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUri = 'http://localhost:5001/user/signup';
  constructor(private http: HttpClient) {}
  signupUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUri, userData);
  }
}
