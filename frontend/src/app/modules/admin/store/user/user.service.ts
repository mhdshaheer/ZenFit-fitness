import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = 'http://localhost:5001/user/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>(this.baseUrl, user);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${user._id}`, user);
  }

  blockUser(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/block`, {});
  }

  unblockUser(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/unblock`, {});
  }
}
