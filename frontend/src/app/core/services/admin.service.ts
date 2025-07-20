import { Observable } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/auth/users`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/auth/users`, user);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/auth/users/${user._id}`, user);
  }

  blockUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}//auth/users/block`, {});
  }

  unblockUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/auth/users/unblock`, {});
  }
}
