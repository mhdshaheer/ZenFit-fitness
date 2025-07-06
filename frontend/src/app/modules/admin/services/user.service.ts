// src/app/core/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  email: string;
  dob: string;
  gender: string;
  status: string | 'active';
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:5001';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/user/users`);
  }
}
